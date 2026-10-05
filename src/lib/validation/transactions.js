import Joi from "joi";

/**
 * Allowed recurring frequency values.
 */
export const RECURRING_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

/**
 * Monetary amounts must be strictly positive and within a sane upper bound.
 * Guards against zero/negative values and float overflow from malformed input.
 *
 * NOTE: Joi 17 ignores the second argument of number.min()/number.max(), so both
 * messages are supplied via a message-code override.
 */
export const amountField = Joi.number()
  .min(0.01)
  .max(1e12)
  .required()
  .messages({
    "number.min": "Amount must be greater than zero",
    "number.max": "Amount is unrealistically large",
  });

/**
 * recurringFrequency is completely optional unless the transaction is marked
 * as recurring (isRecurring === true). When recurring, it is required and must
 * be one of the allowed values. Otherwise the field is ignored entirely
 * (missing, null, or any value is accepted).
 */
export const recurringFrequencyField = Joi.when("isRecurring", {
  is: true,
  then: Joi.string().valid(...RECURRING_FREQUENCIES).required(),
  otherwise: Joi.any().allow(null).optional(),
});

/**
 * NOTE: `user` is intentionally absent from every create schema. The owning user
 * is derived from the verified access token by the route handler and must never
 * be accepted from the request body.
 */
export const expenseCreateSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  amount: amountField,
  expenseDate: Joi.date().required(),
  category: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
  includeInBudget: Joi.boolean().optional(),
});

export const expenseUpdateSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  amount: amountField,
  expenseDate: Joi.date().required(),
  category: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
  includeInBudget: Joi.boolean().optional(),
});

export const incomeCreateSchema = Joi.object({
  companyName: Joi.string().trim().max(200).required(),
  title: Joi.string().trim().max(200).required(),
  amount: amountField,
  incomeDate: Joi.date().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});

export const incomeUpdateSchema = Joi.object({
  companyName: Joi.string().trim().max(200).required(),
  title: Joi.string().trim().max(200).required(),
  amount: amountField,
  incomeDate: Joi.date().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});
