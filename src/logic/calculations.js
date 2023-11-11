export const calculateExpense = (expenses) => {
  let totalExpense = 0;
  expenses?.forEach((expense) => {
    totalExpense = totalExpense + expense.amount;
  });

  return totalExpense;
};

export const calculateIncome = (incomes) => {
  let totalIncome = 0;
  incomes?.forEach((income) => {
    totalIncome = totalIncome + income.amount;
  });

  return totalIncome;
};

export const totalBalance = (totalIncomes, totalExpenses) => {
  return totalIncomes - totalExpenses;
};

export const transactionHistory = (incomes, expenses) => {
  const history = [...incomes, ...expenses];
  history.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return history.slice(0, 3);
};
