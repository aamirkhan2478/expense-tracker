import Papa from "papaparse";

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data, filename, headers) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const csv = Papa.unparse({
    fields: headers || Object.keys(data[0]),
    data: data.map((row) =>
      Object.values(row).map((val) =>
        typeof val === "object" && val !== null ? JSON.stringify(val) : val
      )
    ),
  });

  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToJSON(data, filename) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    alert("No data to export");
    return;
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, "application/json;charset=utf-8;");
}

export function formatIncomeForExport(incomes, currency = "$") {
  return (incomes || []).map((item) => ({
    Type: "Income",
    Title: item.title || "",
    "Company Name": item.companyName || "",
    Amount: item.amount || 0,
    Currency: currency,
    Date: item.incomeDate
      ? new Date(item.incomeDate).toISOString().split("T")[0]
      : "",
    "Created At": item.createdAt
      ? new Date(item.createdAt).toISOString()
      : "",
  }));
}

export function formatExpenseForExport(expenses, currency = "$") {
  return (expenses || []).map((item) => ({
    Type: "Expense",
    Title: item.title || "",
    Amount: item.amount || 0,
    Currency: currency,
    Category: item.category?.name || "Uncategorized",
    Date: item.expenseDate
      ? new Date(item.expenseDate).toISOString().split("T")[0]
      : "",
    "Created At": item.createdAt
      ? new Date(item.createdAt).toISOString()
      : "",
  }));
}

export function formatCategoryForExport(categories) {
  return (categories || []).map((item) => ({
    Name: item.name || "",
    Icon: item.icon || "",
    Budget: item.budget || 0,
    "Created At": item.createdAt
      ? new Date(item.createdAt).toISOString()
      : "",
  }));
}

export function exportAllData({ incomes, expenses, categories, settings }) {
  const timestamp = new Date().toISOString().split("T")[0];
  const data = {
    exportDate: new Date().toISOString(),
    settings,
    summary: {
      totalIncomes: incomes?.length || 0,
      totalExpenses: expenses?.length || 0,
      totalCategories: categories?.length || 0,
    },
    incomes: incomes || [],
    expenses: expenses || [],
    categories: categories || [],
  };
  exportToJSON(data, `spendwise_backup_${timestamp}`);
}
