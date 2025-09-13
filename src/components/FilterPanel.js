import React, { useState } from "react";
import { Filter, Calendar, Truck, User, CreditCard, X } from "lucide-react";
import { format } from "date-fns";

const FilterPanel = ({ onFilterChange, partyNames, lorryTypes, isExpanded, setIsExpanded }) => {
  const [filters, setFilters] = useState({
    date: "",
    month: "",
    invoiceDateFrom: "",
    invoiceDateTo: "",
    invoiceDateFilterType: "normal", // "normal" or "invoice"
    lorryType: "",
    partyName: "",
    accountTypes: [],
    status: "",
  });


  const accountTypes = [
    { value: "S", label: "SS", color: "bg-account-s" },
    { value: "T", label: "ST", color: "bg-account-t" },
    { value: "R", label: "SR", color: "bg-account-r" },
  ];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      date: "",
      month: "",
      invoiceDateFrom: "",
      invoiceDateTo: "",
      invoiceDateFilterType: "normal",
      lorryType: "",
      partyName: "",
      accountTypes: [],
      status: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Month
            </label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Invoice Date Filter */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Invoice Date Filter
            </label>
            <div className="space-y-3">
              {/* Filter Type Selection */}
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="invoiceDateFilterType"
                    value="normal"
                    checked={filters.invoiceDateFilterType === "normal"}
                    onChange={(e) =>
                      handleFilterChange(
                        "invoiceDateFilterType",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Normal Date</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="invoiceDateFilterType"
                    value="invoice"
                    checked={filters.invoiceDateFilterType === "invoice"}
                    onChange={(e) =>
                      handleFilterChange(
                        "invoiceDateFilterType",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Invoice Date</span>
                </label>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.invoiceDateFrom}
                    onChange={(e) =>
                      handleFilterChange("invoiceDateFrom", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.invoiceDateTo}
                    onChange={(e) =>
                      handleFilterChange("invoiceDateTo", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lorry Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Filter by Lorry Type
            </label>
            <select
              value={filters.lorryType}
              onChange={(e) => handleFilterChange("lorryType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Lorry Types</option>
              {lorryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Party Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Filter by Party Name
            </label>
            <select
              value={filters.partyName}
              onChange={(e) => handleFilterChange("partyName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Parties</option>
              {partyNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Type Filter (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Filter by Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map((account) => (
                <button
                  key={account.value}
                  type="button"
                  onClick={() => {
                    const isSelected = filters.accountTypes.includes(account.value);
                    const next = isSelected
                      ? filters.accountTypes.filter((v) => v !== account.value)
                      : [...filters.accountTypes, account.value];
                    handleFilterChange("accountTypes", next);
                  }}
                  className={`p-2 text-center rounded-md border-2 transition-colors ${
                    filters.accountTypes.includes(account.value)
                      ? `${account.color} border-blue-500`
                      : "bg-white border-gray-300 hover:border-blue-300"
                  }`}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.date && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                Date: {format(new Date(filters.date), "dd/MM/yyyy")}
              </span>
            )}
            {filters.month && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                Month: {format(new Date(filters.month + "-01"), "MMMM yyyy")}
              </span>
            )}
            {(filters.invoiceDateFrom || filters.invoiceDateTo) && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md">
                {filters.invoiceDateFilterType === "invoice"
                  ? "Invoice"
                  : "Normal"}{" "}
                Date:{" "}
                {filters.invoiceDateFrom
                  ? format(new Date(filters.invoiceDateFrom), "dd/MM/yyyy")
                  : "..."}{" "}
                -{" "}
                {filters.invoiceDateTo
                  ? format(new Date(filters.invoiceDateTo), "dd/MM/yyyy")
                  : "..."}
              </span>
            )}
            {filters.lorryType && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                Lorry: {filters.lorryType}
              </span>
            )}
            {filters.partyName && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                Party: {filters.partyName}
              </span>
            )}
            {filters.accountTypes && filters.accountTypes.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">
                Account: {filters.accountTypes.join(", ")}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                Status: {filters.status}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
