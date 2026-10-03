import { describe, it, expect } from "vitest";
import {
  getDaysInMonth,
  parseMonth,
  resolveCurrentDay,
  calculateBudgetSummary,
  calculateBudgetFromExpenses,
} from "@/lib/budget/budget-calculator";
import { budgetSetSchema } from "@/lib/validation/budget";

describe("Daily Budget Feature - Unit & Scenario Tests", () => {
  // ── Validation Schema Tests ──
  describe("Budget validation schema", () => {
    it("accepts valid budget payload", () => {
      const { error } = budgetSetSchema.validate({
        month: "2026-10",
        dailyBudget: 600,
      });
      expect(error).toBeUndefined();
    });

    it("rejects non-positive daily budget (0 or negative)", () => {
      const zeroResult = budgetSetSchema.validate({ month: "2026-10", dailyBudget: 0 });
      expect(zeroResult.error).toBeDefined();

      const negResult = budgetSetSchema.validate({ month: "2026-10", dailyBudget: -100 });
      expect(negResult.error).toBeDefined();
    });

    it("rejects invalid month format", () => {
      const invalidMonths = ["2026-13", "2026-0", "26-10", "October 2026", "2026/10", ""];
      for (const m of invalidMonths) {
        const { error } = budgetSetSchema.validate({ month: m, dailyBudget: 600 });
        expect(error).toBeDefined();
      }
    });
  });

  // ── Scenario 1: Daily budget = 600, no expenses ──
  describe("Scenario 1: Daily budget = 600, no expenses", () => {
    it("calculates correct base values for Day 1 with 0 expenses", () => {
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 0,
        spentToday: 0,
        spentThisMonth: 0,
        currentDay: 1,
      });

      expect(summary.dailyBaseBudget).toBe(600);
      expect(summary.carriedForward).toBe(0);
      expect(summary.todayAvailable).toBe(600);
      expect(summary.todayRemaining).toBe(600);
      expect(summary.monthlyBudget).toBe(18600); // 31 * 600
      expect(summary.spentThisMonth).toBe(0);
      expect(summary.remainingMonthlyBudget).toBe(18600);
    });
  });

  // ── Scenario 2: Day 1 spends 300 -> Day 2 available = 900 ──
  describe("Scenario 2: Day 1 spends 300", () => {
    it("carries forward 300 unused budget to Day 2", () => {
      // On Day 2: Day 1 allocated was 600, Day 1 spent was 300 -> carry-forward = 300
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 300, // spent on Day 1
        spentToday: 0,
        spentThisMonth: 300,
        currentDay: 2,
      });

      expect(summary.dailyBaseBudget).toBe(600);
      expect(summary.carriedForward).toBe(300);
      expect(summary.todayAvailable).toBe(900); // 600 + 300
      expect(summary.todayRemaining).toBe(900);
      expect(summary.monthlyBudget).toBe(18600);
      expect(summary.spentThisMonth).toBe(300);
      expect(summary.remainingMonthlyBudget).toBe(18300);
    });
  });

  // ── Scenario 3: Day 2 spends 200 -> Day 3 available = 1,300 ──
  describe("Scenario 3: Day 2 spends 200", () => {
    it("accumulates remaining budget of two days (700) into Day 3", () => {
      // Days 1 & 2 allocated = 2 * 600 = 1200
      // Spent before Day 3 = 300 (Day 1) + 200 (Day 2) = 500
      // Carried forward = 1200 - 500 = 700
      // Day 3 todayAvailable = 600 + 700 = 1300
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 500,
        spentToday: 0,
        spentThisMonth: 500,
        currentDay: 3,
      });

      expect(summary.dailyBaseBudget).toBe(600);
      expect(summary.carriedForward).toBe(700);
      expect(summary.todayAvailable).toBe(1300);
      expect(summary.monthlyBudget).toBe(18600);
      expect(summary.spentThisMonth).toBe(500);
      expect(summary.remainingMonthlyBudget).toBe(18100);
    });
  });

  // ── Scenario 4: Day 3 spends 700 -> Day 4 available = 1,200 ──
  describe("Scenario 4: Day 3 spends 700", () => {
    it("correctly rolls over remaining from Days 1-3 to Day 4", () => {
      // Days 1, 2, 3 allocated = 3 * 600 = 1800
      // Spent = 300 + 200 + 700 = 1200
      // Carry forward = 1800 - 1200 = 600
      // Day 4 todayAvailable = 600 + 600 = 1200
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 1200,
        spentToday: 0,
        spentThisMonth: 1200,
        currentDay: 4,
      });

      expect(summary.carriedForward).toBe(600);
      expect(summary.todayAvailable).toBe(1200);
      expect(summary.monthlyBudget).toBe(18600);
      expect(summary.remainingMonthlyBudget).toBe(17400);
    });
  });

  // ── Scenario 5: Overspending ──
  describe("Scenario 5: Overspending carries negative balance forward", () => {
    it("handles Day 1 overspending of 900, carrying -300 to Day 2 (available = 300)", () => {
      // Day 1: Budget = 600, Spent = 900 -> deficit of -300
      // Day 2: Base = 600, Carried forward = -300 -> Available = 300
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 900,
        spentToday: 0,
        spentThisMonth: 900,
        currentDay: 2,
      });

      expect(summary.dailyBaseBudget).toBe(600);
      expect(summary.carriedForward).toBe(-300);
      expect(summary.todayAvailable).toBe(300); // 600 + (-300) = 300
      expect(summary.spentThisMonth).toBe(900);
      expect(summary.remainingMonthlyBudget).toBe(17700);
    });

    it("handles multiple days of cumulative overspending", () => {
      // 3 days elapsed: allocated = 3 * 600 = 1800. Total spent = 2500.
      // Carried forward = 1800 - 2500 = -700.
      // Day 4: Base = 600, Available = 600 + (-700) = -100.
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 2500,
        spentToday: 0,
        spentThisMonth: 2500,
        currentDay: 4,
      });

      expect(summary.carriedForward).toBe(-700);
      expect(summary.todayAvailable).toBe(-100);
    });
  });

  // ── Scenario 6: Multiple expenses on the same day ──
  describe("Scenario 6: Multiple expenses on the same day", () => {
    it("sums multiple expenses on Day 1 accurately for Day 2 carry-forward", () => {
      const expenses = [
        { amount: 100, expenseDate: "2026-10-01T08:00:00Z", includeInBudget: true },
        { amount: 150, expenseDate: "2026-10-01T12:30:00Z", includeInBudget: true },
        { amount: 50, expenseDate: "2026-10-01T19:00:00Z", includeInBudget: true },
      ];

      const summary = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"), // Day 2
      });

      expect(summary.currentDay).toBe(2);
      expect(summary.spentBeforeToday).toBe(300);
      expect(summary.carriedForward).toBe(300);
      expect(summary.todayAvailable).toBe(900);
    });
  });

  // ── Scenario 7: Editing an expense ──
  describe("Scenario 7: Editing an expense", () => {
    it("dynamically reflects updated expense amount on carry-forward", () => {
      // Initial Day 1 expense: 300 -> Day 2 available = 900
      const initial = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [{ amount: 300, expenseDate: "2026-10-01T12:00:00Z", includeInBudget: true }],
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });
      expect(initial.todayAvailable).toBe(900);

      // User edits Day 1 expense to 500
      const afterEdit = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [{ amount: 500, expenseDate: "2026-10-01T12:00:00Z", includeInBudget: true }],
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });
      expect(afterEdit.carriedForward).toBe(100); // 600 - 500 = 100
      expect(afterEdit.todayAvailable).toBe(700); // 600 + 100 = 700
    });
  });

  // ── Scenario 8: Deleting an expense ──
  describe("Scenario 8: Deleting an expense", () => {
    it("dynamically recalculates carry-forward when an expense is deleted", () => {
      // Day 1 has 300 spent -> Day 2 available = 900
      // Delete expense: expenses array becomes empty
      const afterDelete = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [],
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });
      expect(afterDelete.spentBeforeToday).toBe(0);
      expect(afterDelete.carriedForward).toBe(600); // 1 * 600 - 0
      expect(afterDelete.todayAvailable).toBe(1200); // 600 + 600
    });
  });

  // ── Scenario 9: Expense dated on a previous day (backdated) ──
  describe("Scenario 9: Backdated expense", () => {
    it("adjusts carry-forward dynamically when an expense is logged for an earlier date", () => {
      // Today is Day 3. No expenses initially:
      // Allocated until Day 2 = 1200. Carried forward = 1200. Available = 1800.
      const beforeBackdate = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [],
        referenceDate: new Date("2026-10-03T10:00:00Z"),
      });
      expect(beforeBackdate.todayAvailable).toBe(1800);

      // User adds an expense backdated to Day 1 for 400
      const afterBackdate = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [{ amount: 400, expenseDate: "2026-10-01T12:00:00Z", includeInBudget: true }],
        referenceDate: new Date("2026-10-03T10:00:00Z"),
      });
      expect(afterBackdate.spentBeforeToday).toBe(400);
      expect(afterBackdate.carriedForward).toBe(800); // 1200 - 400
      expect(afterBackdate.todayAvailable).toBe(1400); // 600 + 800
    });
  });

  // ── Scenario 10: First day of a month (Day 1) ──
  describe("Scenario 10: First day of a month", () => {
    it("carries 0 forward on Day 1 and does not carry over from previous month", () => {
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 0,
        spentToday: 0,
        currentDay: 1,
      });

      expect(summary.currentDay).toBe(1);
      expect(summary.carriedForward).toBe(0);
      expect(summary.todayAvailable).toBe(600);
    });
  });

  // ── Scenario 11: Last day of a month ──
  describe("Scenario 11: Last day of a month (October 31)", () => {
    it("evaluates Day 31 of 31 correctly", () => {
      // 30 days have elapsed.
      // Allocated until yesterday = 30 * 600 = 18,000.
      // Total spent before Day 31 = 15,000.
      // Carry forward = 3,000.
      // Day 31 available = 600 + 3000 = 3600.
      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        spentBeforeToday: 15000,
        spentToday: 200,
        spentThisMonth: 15200,
        currentDay: 31,
      });

      expect(summary.daysInMonth).toBe(31);
      expect(summary.currentDay).toBe(31);
      expect(summary.daysRemaining).toBe(0);
      expect(summary.carriedForward).toBe(3000);
      expect(summary.todayAvailable).toBe(3600);
      expect(summary.todayRemaining).toBe(3400);
      expect(summary.remainingMonthlyBudget).toBe(3400); // 18600 - 15200 = 3400
    });
  });

  // ── Scenario 12: February with 28 days ──
  describe("Scenario 12: February with 28 days (non-leap year)", () => {
    it("calculates 28 days for 2023-02 and 2025-02 (monthly budget = 16,800)", () => {
      expect(getDaysInMonth(2023, 2)).toBe(28);
      expect(getDaysInMonth(2025, 2)).toBe(28);

      const parsed = parseMonth("2023-02");
      expect(parsed.daysInMonth).toBe(28);

      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2023-02",
        currentDay: 1,
      });
      expect(summary.monthlyBudget).toBe(16800); // 600 * 28 = 16800
    });
  });

  // ── Scenario 13: Leap-year February with 29 days ──
  describe("Scenario 13: Leap-year February with 29 days", () => {
    it("calculates 29 days for 2024-02 and 2028-02 (monthly budget = 17,400)", () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2028, 2)).toBe(29);

      const parsed = parseMonth("2024-02");
      expect(parsed.daysInMonth).toBe(29);

      const summary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2024-02",
        currentDay: 1,
      });
      expect(summary.monthlyBudget).toBe(17400); // 600 * 29 = 17400
    });
  });

  // ── Scenario 14: New month with no configured budget ──
  describe("Scenario 14: New month behavior", () => {
    it("does not automatically copy previous month's budget", () => {
      // In calculateBudgetSummary, passing month returns calculations isolated to that month
      const octSummary = calculateBudgetSummary({
        dailyBudget: 600,
        month: "2026-10",
        currentDay: 1,
      });
      expect(octSummary.carriedForward).toBe(0);
      expect(octSummary.month).toBe("2026-10");

      // September budget has no carry-forward bleeding into October
      const septSummary = calculateBudgetSummary({
        dailyBudget: 500,
        month: "2026-09",
        currentDay: 30,
        spentBeforeToday: 10000,
      });
      expect(septSummary.month).toBe("2026-09");
      expect(septSummary.daysInMonth).toBe(30);
    });
  });

  // ── Scenario 15: Multiple users with separate budgets ──
  describe("Scenario 15: Multi-user mathematical isolation", () => {
    it("calculates distinct budgets and summaries for User A and User B independently", () => {
      const userAExpenses = [{ amount: 300, expenseDate: "2026-10-01T10:00:00Z", includeInBudget: true }];
      const userBExpenses = [{ amount: 750, expenseDate: "2026-10-01T10:00:00Z", includeInBudget: true }];

      const userASummary = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: userAExpenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });

      const userBSummary = calculateBudgetFromExpenses({
        dailyBudget: 1000,
        month: "2026-10",
        expenses: userBExpenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });

      // User A (Budget 600, Day 1 spent 300 -> Day 2 available = 900)
      expect(userASummary.dailyBaseBudget).toBe(600);
      expect(userASummary.carriedForward).toBe(300);
      expect(userASummary.todayAvailable).toBe(900);
      expect(userASummary.monthlyBudget).toBe(18600);

      // User B (Budget 1000, Day 1 spent 750 -> Day 2 available = 1250)
      expect(userBSummary.dailyBaseBudget).toBe(1000);
      expect(userBSummary.carriedForward).toBe(250);
      expect(userBSummary.todayAvailable).toBe(1250);
      expect(userBSummary.monthlyBudget).toBe(31000);
    });
  });

  // ── Scenario 16: includeInBudget filtering ──
  describe("Scenario 16: includeInBudget field filtering", () => {
    it("excludes expenses where includeInBudget is false", () => {
      const expenses = [
        { amount: 500, expenseDate: "2026-10-01T10:00:00Z", includeInBudget: true },
        { amount: 300, expenseDate: "2026-10-01T14:00:00Z", includeInBudget: false },
      ];

      const summary = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });

      // Only the 500 expense (includeInBudget: true) should be counted
      expect(summary.spentBeforeToday).toBe(500);
      expect(summary.spentThisMonth).toBe(500);
      expect(summary.carriedForward).toBe(100); // 600 - 500
      expect(summary.todayAvailable).toBe(700); // 600 + 100
    });

    it("excludes expenses where includeInBudget is missing (undefined)", () => {
      const expenses = [
        { amount: 200, expenseDate: "2026-10-01T10:00:00Z" }, // no includeInBudget field
        { amount: 400, expenseDate: "2026-10-01T14:00:00Z", includeInBudget: true },
      ];

      const summary = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });

      // Only the 400 expense should be counted
      expect(summary.spentBeforeToday).toBe(400);
      expect(summary.spentThisMonth).toBe(400);
      expect(summary.carriedForward).toBe(200); // 600 - 400
    });

    it("returns zero spending when all expenses have includeInBudget: false", () => {
      const expenses = [
        { amount: 100, expenseDate: "2026-10-01T10:00:00Z", includeInBudget: false },
        { amount: 200, expenseDate: "2026-10-01T14:00:00Z", includeInBudget: false },
      ];

      const summary = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses,
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });

      expect(summary.spentBeforeToday).toBe(0);
      expect(summary.spentToday).toBe(0);
      expect(summary.spentThisMonth).toBe(0);
      expect(summary.carriedForward).toBe(600);
      expect(summary.todayAvailable).toBe(1200);
    });

    it("toggling includeInBudget from false to true includes expense in budget", () => {
      // Before toggle: expense excluded
      const before = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [{ amount: 300, expenseDate: "2026-10-01T12:00:00Z", includeInBudget: false }],
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });
      expect(before.spentBeforeToday).toBe(0);
      expect(before.todayAvailable).toBe(1200);

      // After toggle: same expense now included
      const after = calculateBudgetFromExpenses({
        dailyBudget: 600,
        month: "2026-10",
        expenses: [{ amount: 300, expenseDate: "2026-10-01T12:00:00Z", includeInBudget: true }],
        referenceDate: new Date("2026-10-02T10:00:00Z"),
      });
      expect(after.spentBeforeToday).toBe(300);
      expect(after.todayAvailable).toBe(900);
    });
  });
});
