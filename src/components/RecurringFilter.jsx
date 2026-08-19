"use client";

import { Select } from "@chakra-ui/react";

export const RECURRING_FILTER_OPTIONS = [
  { value: "true", label: "Recurring Only" },
  { value: "false", label: "One-time Only" },
];

const RecurringFilter = ({ value, onChange, ...props }) => (
  <Select
    value={value}
    onChange={onChange}
    placeholder="All Transactions"
    borderRadius="xl"
    focusBorderColor="teal.400"
    {...props}
  >
    {RECURRING_FILTER_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </Select>
);

export default RecurringFilter;
