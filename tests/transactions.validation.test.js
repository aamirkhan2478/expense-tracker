import { describe, it, expect } from "vitest";
import {
  RECURRING_FREQUENCIES,
  expenseCreateSchema,
  expenseUpdateSchema,
  incomeCreateSchema,
  incomeUpdateSchema,
} from "@/lib/validation/transactions";

const baseExpense = {
  title: "Groceries",
  amount: 120,
  expenseDate: "2026-08-01",
  category: "60a1b2c3d4e5f6a7b8c9d0e1",
};

const baseIncome = {
  companyName: "Acme Corp",
  title: "Salary",
  amount: 5000,
  incomeDate: "2026-08-01",
};

const baseExpenseUpdate = {
  title: baseExpense.title,
  amount: baseExpense.amount,
  expenseDate: baseExpense.expenseDate,
  category: baseExpense.category,
};

const baseIncomeUpdate = {
  companyName: baseIncome.companyName,
  title: baseIncome.title,
  amount: baseIncome.amount,
  incomeDate: baseIncome.incomeDate,
};

function validate(schema, payload) {
  const { error } = schema.validate(payload, { abortEarly: false });
  return error ? error.details[0].message : null;
}

describe("recurringFrequency is optional for non-recurring transactions", () => {
  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s succeeds when recurringFrequency is omitted", (_, schema, payload) => {
    expect(validate(schema, payload)).toBeNull();
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s succeeds when isRecurring is false with recurringFrequency null", (_, schema, payload) => {
    expect(validate(schema, { ...payload, isRecurring: false, recurringFrequency: null })).toBeNull();
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s ignores recurringFrequency entirely when not recurring", (_, schema, payload) => {
    expect(validate(schema, { ...payload, isRecurring: false, recurringFrequency: "banana" })).toBeNull();
  });
});

describe("the owning user is server-derived and never accepted from the client", () => {
  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["income create", incomeCreateSchema, baseIncome],
  ])("%s rejects a client-supplied user field", (_, schema, payload) => {
    const message = validate(schema, {
      ...payload,
      user: "60a1b2c3d4e5f6a7b8c9d0e2",
    });
    expect(message).toContain("user");
  });

  it.each([
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s rejects a client-supplied user field", (_, schema, payload) => {
    const message = validate(schema, {
      ...payload,
      user: "60a1b2c3d4e5f6a7b8c9d0e2",
    });
    expect(message).toContain("user");
  });
});

describe("monetary amounts must be positive and bounded", () => {
  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s rejects a zero amount", (_, schema, payload) => {
    expect(validate(schema, { ...payload, amount: 0 })).toContain("Amount must be greater than zero");
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s rejects a negative amount", (_, schema, payload) => {
    expect(validate(schema, { ...payload, amount: -50 })).toContain("Amount must be greater than zero");
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s rejects an absurdly large amount", (_, schema, payload) => {
    expect(validate(schema, { ...payload, amount: 1e15 })).toContain("Amount is unrealistically large");
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s accepts the smallest valid amount", (_, schema, payload) => {
    expect(validate(schema, { ...payload, amount: 0.01 })).toBeNull();
  });
});

describe("recurringFrequency is required and validated for recurring transactions", () => {
  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s succeeds with a valid recurring frequency", (_, schema, payload) => {
    for (const freq of RECURRING_FREQUENCIES) {
      expect(validate(schema, { ...payload, isRecurring: true, recurringFrequency: freq })).toBeNull();
    }
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s fails when recurring frequency is missing for a recurring transaction", (_, schema, payload) => {
    const message = validate(schema, { ...payload, isRecurring: true });
    expect(message).toContain("recurringFrequency");
  });

  it.each([
    ["expense create", expenseCreateSchema, baseExpense],
    ["expense update", expenseUpdateSchema, baseExpenseUpdate],
    ["income create", incomeCreateSchema, baseIncome],
    ["income update", incomeUpdateSchema, baseIncomeUpdate],
  ])("%s rejects invalid recurringFrequency only for recurring transactions", (_, schema, payload) => {
    const message = validate(schema, { ...payload, isRecurring: true, recurringFrequency: "biweekly" });
    expect(message).toContain("recurringFrequency");
    expect(validate(schema, { ...payload, isRecurring: false, recurringFrequency: "biweekly" })).toBeNull();
  });
});
