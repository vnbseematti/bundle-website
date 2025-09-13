import React, { useState } from "react";
import { supabase } from "../supabase";
import { Search, Download, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatDate,
  getAccountTypeColor,
  calculateTotalAmount,
  calculateOpeningBalance,
  calculateCurrentDayTotal,
  calculateTotalWithOpeningBalance,
} from "../utils";

const DataTable = ({ data, onEdit, onDelete, user, filtersExpanded }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(filtersExpanded ? 10 : 15);
  // Sync itemsPerPage with filter panel show/hide
  React.useEffect(() => {
    setItemsPerPage(filtersExpanded ? 10 : 15);
    setCurrentPage(1);
  }, [filtersExpanded]);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const statusOptions = [
    { value: "OPEN", label: "OPEN" },
    { value: "PENDING", label: "PENDING" },
  ];

  // Update status in Supabase
  const handleStatusUpdate = async (id, newStatus) => {
    setStatusUpdating(true);
    const { error } = await supabase
      .from("bundle_arrivals")
      .update({ status: newStatus })
      .eq("id", id);
    setStatusUpdating(false);
    setEditingStatusId(null);
    // Optionally, you may want to refresh data from parent or trigger a reload
    window.location.reload(); // Simple reload for now
  };

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  const matchesStatus = statusFilter ? (item.status || "") === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const totalAmount = calculateTotalAmount(filteredData);
  const openingBalance = calculateOpeningBalance(data);
  const currentDayTotal = calculateCurrentDayTotal(data);
  const totalWithOpeningBalance = calculateTotalWithOpeningBalance(data);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const exportToCSV = async () => {
    setIsExportingCSV(true);
    try {
      // Add a small delay to make loading state visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      const headers = [
        "S.No",
        "Date",
        "Lorry",
        "LR No",
        "City",
        "Party Name",
        "A/c",
        "Bundle",
        "Invoice No",
        "Invoice Date",
        "Amount",
        "PH NO",
        "STATUS",
        "Itemtype",
      ];


      // Place 'Opening Balance' in Party Name, amount in Amount column
      const openingBalanceRow = [
        '', '', '', '', '', 'Opening Balance', '', '', '', '',
        openingBalance.toFixed(2),
        '', '', ''
      ];

      const csvContent = [
        openingBalanceRow.join(","),
        headers.join(","),
        ...filteredData.map((item, index) =>
          [
            index + 1,
            formatDate(item.date),
            item.lorry_type,
            item.lorry_no,
            item.city,
            `"${item.party_name}"`,
            item.account_type,
            `"${item.bundle}"`,
            item.invoice_no,
            formatDate(item.invoice_date),
            item.amount,
            item.phone_no,
            item.status,
            `"${item.itemtype || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bundle_arrivals_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExportingCSV(false);
    }
  };

  const exportToPDF = async () => {
    setIsExportingPDF(true);
    try {
      // Add a small delay to make loading state visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      const doc = new jsPDF({ orientation: "landscape" });
      const title = `Bundle Arrivals (${new Date().toLocaleDateString()})`;
      doc.setFontSize(14);
      doc.text(title, 14, 16);

      const headers = [
        "S.No",
        "Date",
        "Lorry",
        "LR No",
        "City",
        "Party Name",
        "A/c",
        "Bundle",
        "Invoice No",
        "Invoice Date",
        "Amount",
        "PH NO",
        "STATUS",
        "Itemtype",
      ];



      // Place 'Opening Balance' in Party Name, amount in Amount column for PDF
      const openingBalanceRowPDF = [
        '', '', '', '', '', 'Opening Balance', '', '', '', '',
        openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        '', '', ''
      ];

      const rows = [
        openingBalanceRowPDF,
        ...filteredData.map((item, index) => [
          index + 1,
          formatDate(item.date),
          item.lorry_type,
          item.lorry_no,
          item.city,
          item.party_name,
          item.account_type,
          item.bundle,
          item.invoice_no,
          formatDate(item.invoice_date),
          `₹${parseFloat(item.amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`,
          item.phone_no || "",
          item.status,
          item.itemtype || "",
        ])
      ];

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 22,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`bundle_arrivals_${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No Data Available</h3>
          <p className="text-sm">
            Start by adding some bundle arrival entries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Opening Balance Display - Hidden for staff (user role) */}
      {user && user.role !== "user" && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Opening Balance</div>
              <div className="text-lg font-semibold text-blue-600">
                ₹
                {openingBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Today's Entries</div>
              <div className="text-lg font-semibold text-green-600">
                ₹
                {currentDayTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Balance</div>
              <div className="text-lg font-semibold text-purple-600">
                ₹
                {totalWithOpeningBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Bundle Arrivals ({filteredData.length} entries)
            </h3>
            <label className="flex items-center text-sm font-normal text-gray-600">
              <span className="mr-2">Items per page:</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page on change
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                disabled={isExportingCSV || isExportingPDF}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingCSV ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExportingCSV ? "Exporting..." : "CSV"}</span>
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExportingCSV || isExportingPDF}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExportingPDF ? "Exporting..." : "PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lorry
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                LR No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party Name
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                A/c
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bundle
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                PH NO
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Itemtype
              </th>
              {user && user.role !== "user" && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:opacity-80 transition-opacity ${getAccountTypeColor(
                  item.account_type
                )}`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.date)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.lorry_type}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.lorry_no}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.city}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.party_name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  {item.account_type}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.bundle}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.invoice_no}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.invoice_date)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  ₹
                  {parseFloat(item.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.phone_no}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {editingStatusId === item.id ? (
                    <select
                      className="px-2 py-1 text-xs rounded-full border focus:outline-none"
                      value={item.status}
                      onChange={e => handleStatusUpdate(item.id, e.target.value)}
                      disabled={statusUpdating}
                      onBlur={() => setEditingStatusId(null)}
                      autoFocus
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      className={`px-2 py-1 text-xs rounded-full focus:outline-none ${
                        (item.status || "") === "OPEN"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      onClick={() => setEditingStatusId(item.id)}
                      title="Click to update status"
                    >
                      {item.status === "" || item.status == null ? (
                        <span style={{ color: 'black', fontWeight: 'bold' }}>–</span>
                      ) : (
                        item.status
                      )}
                    </button>
                  )}
      {/* Status filter clear button */}
      {statusFilter && (
        <div className="mb-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded text-sm"
            onClick={() => setStatusFilter("")}
          >
            Clear Status Filter
          </button>
        </div>
      )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.itemtype || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {user && user.role !== "user" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {currentData.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-lg shadow p-4 ${getAccountTypeColor(
              item.account_type
            )}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  #{startIndex + index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.lorry_type}
                </span>
              </div>
              {user && user.role !== "user" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(item.date)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">LR No:</span>
                <span className="ml-2 text-gray-900">{item.lorry_no}</span>
              </div>
              <div>
                <span className="text-gray-500">City:</span>
                <span className="ml-2 text-gray-900">{item.city}</span>
              </div>
              <div>
                <span className="text-gray-500">A/c:</span>
                <span className="ml-2 text-gray-900">{item.account_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Party:</span>
                <span className="ml-2 text-gray-900">{item.party_name}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Bundle:</span>
                <span className="ml-2 text-gray-900">{item.bundle}</span>
              </div>
              <div>
                <span className="text-gray-500">Invoice:</span>
                <span className="ml-2 text-gray-900">{item.invoice_no}</span>
              </div>
              <div>
                <span className="text-gray-500">Inv Date:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(item.invoice_date)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="ml-2 text-gray-900">{item.phone_no}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    item.status === "OPEN"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.status === "" || item.status == null ? (
                    <span style={{ color: 'black', fontWeight: 'bold' }}>–</span>
                  ) : (
                    item.status
                  )}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Itemtype:</span>
                <span className="ml-2 text-gray-900">
                  {item.itemtype || "-"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  ₹
                  {parseFloat(item.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              results
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Total Amount Summary */}
      {filteredData.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Total Entries: {filteredData.length}
            </div>
            <div className="text-lg font-semibold text-gray-900 text-center sm:text-right">
              Total Amount: ₹
              {totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
