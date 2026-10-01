import Joi from "joi";

export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const budgetSetSchema = Joi.object({
  month: Joi.string()
    .pattern(MONTH_REGEX)
    .required()
    .messages({
      "string.pattern.base": "Month must be in YYYY-MM format (e.g. 2026-10)",
      "any.required": "Month is required",
    }),
  dailyBudget: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Daily budget must be a number",
      "number.positive": "Daily budget must be greater than zero",
      "any.required": "Daily budget is required",
    }),
});
