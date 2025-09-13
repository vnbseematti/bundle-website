import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";

// Format date for display
export const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    return format(parseISO(date), "dd/MM/yyyy");
  }
  return format(date, "dd/MM/yyyy");
};

// Format date for input field
export const formatDateForInput = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    return format(parseISO(date), "yyyy-MM-dd");
  }
  return format(date, "yyyy-MM-dd");
};

// Calculate total amount for filtered data
export const calculateTotalAmount = (data) => {
  return data.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
};

// Get month range for filtering
export const getMonthRange = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return { start, end };
};

// Filter data based on various criteria
export const filterData = (data, filters) => {
  let filtered = [...data];

  if (filters.date) {
    filtered = filtered.filter(
      (item) =>
        formatDateForInput(item.date) === formatDateForInput(filters.date)
    );
  }

  if (filters.month) {
    const monthYear = filters.month; // Format: "2024-01"
    filtered = filtered.filter((item) => {
      const itemDate = parseISO(item.date);
      const itemMonthYear = format(itemDate, "yyyy-MM");
      return itemMonthYear === monthYear;
    });
  }

  // Invoice Date Range Filter
  if (filters.invoiceDateFrom || filters.invoiceDateTo) {
    filtered = filtered.filter((item) => {
      const dateField =
        filters.invoiceDateFilterType === "invoice"
          ? item.invoice_date
          : item.date;
      const itemDate = parseISO(dateField);

      if (filters.invoiceDateFrom && filters.invoiceDateTo) {
        const fromDate = parseISO(filters.invoiceDateFrom);
        const toDate = parseISO(filters.invoiceDateTo);
        return itemDate >= fromDate && itemDate <= toDate;
      } else if (filters.invoiceDateFrom) {
        const fromDate = parseISO(filters.invoiceDateFrom);
        return itemDate >= fromDate;
      } else if (filters.invoiceDateTo) {
        const toDate = parseISO(filters.invoiceDateTo);
        return itemDate <= toDate;
      }
      return true;
    });
  }

  if (filters.lorryType) {
    filtered = filtered.filter((item) =>
      item.lorry_type.toLowerCase().includes(filters.lorryType.toLowerCase())
    );
  }

  if (filters.partyName) {
    filtered = filtered.filter((item) =>
      item.party_name.toLowerCase().includes(filters.partyName.toLowerCase())
    );
  }

  if (filters.accountTypes && filters.accountTypes.length > 0) {
    const set = new Set(filters.accountTypes);
    filtered = filtered.filter((item) => set.has(item.account_type));
  }

  if (filters.status) {
    filtered = filtered.filter(
      (item) => (item.status || "OPEN") === filters.status
    );
  }

  return filtered;
};

// Get unique party names for autocomplete
export const getUniquePartyNames = (data) => {
  const names = data.map((item) => item.party_name);
  return [...new Set(names)].sort();
};

// Get unique cities for autocomplete
export const getUniqueCities = (data) => {
  const cities = data.map((item) => item.city).filter(Boolean);
  return [...new Set(cities)].sort();
};

// Get account type color
export const getAccountTypeColor = (accountType) => {
  switch (accountType) {
    case "S":
      return "bg-account-s";
    case "T":
      return "bg-account-t";
    case "R":
      return "bg-account-r";
    default:
      return "bg-gray-100";
  }
};

// Check for duplicate entry
export const checkDuplicateEntry = (formData, existingData) => {
  const normalizeString = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : value;
  const normalizeOptionalString = (value) =>
    value === null || value === undefined ? "" : normalizeString(value);
  const normalizeDate = (value) => {
    if (!value) return "";
    try {
      // Ensure both stored and input dates compare as yyyy-MM-dd
      return formatDateForInput(value);
    } catch (_) {
      return String(value);
    }
  };
  const normalizeAmount = (value) => {
    const n = parseFloat(value);
    return Number.isNaN(n) ? 0 : n;
  };

  // Duplicate criteria: Party Name + Invoice No + Invoice Date + Amount
  const duplicate = existingData.find((item) => {
    return (
      normalizeString(item.party_name) === normalizeString(formData.party_name) &&
      normalizeString(item.invoice_no) === normalizeString(formData.invoice_no) &&
      normalizeDate(item.invoice_date) === normalizeDate(formData.invoice_date) &&
      normalizeAmount(item.amount) === normalizeAmount(formData.amount)
    );
  });

  return duplicate;
};

// Validate form data
export const validateFormData = (data, existingData = []) => {
  const errors = {};

  if (!data.date) errors.date = "Date is required";
  if (!data.lorry_type) errors.lorry_type = "Lorry type is required";
  if (!data.lorry_no) errors.lorry_no = "Lorry number is required";
  if (!data.city) errors.city = "City is required";
  if (!data.party_name) errors.party_name = "Party name is required";
  if (!data.account_type) errors.account_type = "Account type is required";
  if (!data.bundle) errors.bundle = "Bundle is required";
  if (!data.invoice_no) errors.invoice_no = "Invoice number is required";
  if (!data.invoice_date) errors.invoice_date = "Invoice date is required";
  if (!data.amount || data.amount <= 0)
    errors.amount = "Valid amount is required";
  // Status is optional, so no validation needed
  // Phone number and itemtype are optional, so no validation needed

  // Check for duplicate entry
  const duplicate = checkDuplicateEntry(data, existingData);
  if (duplicate) {
    errors.duplicate =
      "Duplicate entry found (Party Name + Invoice No + Invoice Date + Amount).";
  }

  return errors;
};

// Calculate opening balance for current month
export const calculateOpeningBalance = (data, currentDate = new Date()) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  // Get entries from 1st of current month till yesterday (opening balance resets monthly)
  const openingBalanceEntries = data.filter((item) => {
    const itemDate = parseISO(item.date);
    const itemMonth = itemDate.getMonth();
    const itemYear = itemDate.getFullYear();
    const itemDay = itemDate.getDate();

    // Only include entries from current month, from 1st till yesterday
    return (
      itemMonth === currentMonth &&
      itemYear === currentYear &&
      itemDay >= 1 &&
      itemDay < currentDay
    );
  });

  // Calculate total from 1st of current month till yesterday
  return openingBalanceEntries.reduce(
    (total, item) => total + parseFloat(item.amount || 0),
    0
  );
};

// Get current day entries
export const getCurrentDayEntries = (data, currentDate = new Date()) => {
  return data.filter((item) => {
    const itemDate = parseISO(item.date);
    return isSameDay(itemDate, currentDate);
  });
};

// Calculate current day total
export const calculateCurrentDayTotal = (data, currentDate = new Date()) => {
  const currentDayEntries = getCurrentDayEntries(data, currentDate);
  return currentDayEntries.reduce(
    (total, item) => total + parseFloat(item.amount || 0),
    0
  );
};

// Calculate total with opening balance
export const calculateTotalWithOpeningBalance = (
  data,
  currentDate = new Date()
) => {
  const openingBalance = calculateOpeningBalance(data, currentDate);
  const currentDayTotal = calculateCurrentDayTotal(data, currentDate);
  return openingBalance + currentDayTotal;
};

// Get monthly totals for dashboard
export const getMonthlyTotals = (data, currentDate = new Date()) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Current month entries
  const currentMonthEntries = data.filter((item) => {
    const itemDate = parseISO(item.date);
    return (
      itemDate.getMonth() === currentMonth &&
      itemDate.getFullYear() === currentYear
    );
  });

  const currentMonthTotal = currentMonthEntries.reduce(
    (total, item) => total + parseFloat(item.amount || 0),
    0
  );
  const totalPurchase = data.reduce(
    (total, item) => total + parseFloat(item.amount || 0),
    0
  );

  return {
    currentMonthTotal,
    totalPurchase,
    openingBalance: calculateOpeningBalance(data, currentDate),
  };
};
