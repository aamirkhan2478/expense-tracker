import Joi from "joi";

/**
 * Allowed recurring frequency values.
 */
export const RECURRING_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

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

export const expenseCreateSchema = Joi.object({
  title: Joi.string().required(),
  amount: Joi.number().required(),
  expenseDate: Joi.date().required(),
  category: Joi.string().required(),
  user: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});

export const expenseUpdateSchema = Joi.object({
  title: Joi.string().required(),
  amount: Joi.number().required(),
  expenseDate: Joi.date().required(),
  category: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});

export const incomeCreateSchema = Joi.object({
  companyName: Joi.string().required(),
  title: Joi.string().required(),
  amount: Joi.number().required(),
  incomeDate: Joi.date().required(),
  user: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});

export const incomeUpdateSchema = Joi.object({
  companyName: Joi.string().required(),
  title: Joi.string().required(),
  amount: Joi.number().required(),
  incomeDate: Joi.date().required(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: recurringFrequencyField,
});
