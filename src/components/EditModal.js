import React, { useState, useEffect } from "react";
import { X, Save, Edit } from "lucide-react";
import { supabase } from "../supabase";
import { validateFormData } from "../utils";

const EditModal = ({ isOpen, onClose, item, onUpdate, partyNames }) => {
  const [formData, setFormData] = useState({
    date: "",
    lorry_type: "",
    lorry_no: "",
    city: "",
    party_name: "",
    account_type: "",
    bundle: "",
    invoice_no: "",
    invoice_date: "",
    amount: "",
    phone_no: "",
    status: "OPEN",
    itemtype: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lorry type options
  const lorryTypes = [
    "AKR",
    "PNP",
    "VRL",
    "MSS",
    "LAXMI CARCO",
    "BLUEDART",
    "BY HAND",
    "JUPITER",
    "LCM",
    "KLS",
    "KAVITHA",
    "LPL",
    "GLS",
    "RATHEMEENA",
    "SVT",
    "VMB",
    "A1 Travels",
    "By Bus",
    "Professional",
  ];

  const accountTypes = [
    { value: "S", label: "SS", color: "bg-account-s" },
    { value: "T", label: "ST", color: "bg-account-t" },
    { value: "R", label: "SR", color: "bg-account-r" },
  ];

  const statusOptions = [
    { value: "OPEN", label: "OPEN" },
    { value: "PENDING", label: "PENDING" },
  ];

  // Load item data when modal opens
  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        date: item.date,
        lorry_type: item.lorry_type,
        lorry_no: item.lorry_no,
        city: item.city || "",
        party_name: item.party_name,
        account_type: item.account_type,
        bundle: item.bundle,
        invoice_no: item.invoice_no,
        invoice_date: item.invoice_date,
        amount: item.amount.toString(),
        phone_no: item.phone_no || "",
        status: item.status || "OPEN",
        itemtype: item.itemtype || "",
      });
      setErrors({});
    }
  }, [item, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("bundle_arrivals")
        .update({
          date: formData.date,
          lorry_type: formData.lorry_type,
          lorry_no: formData.lorry_no,
          city: formData.city,
          party_name: formData.party_name,
          account_type: formData.account_type,
          bundle: formData.bundle,
          invoice_no: formData.invoice_no,
          invoice_date: formData.invoice_date,
          amount: parseFloat(formData.amount),
          phone_no: formData.phone_no,
          status: formData.status,
          itemtype: formData.itemtype,
        })
        .eq("id", item.id)
        .select();

      if (error) throw error;

      if (onUpdate) {
        onUpdate(data[0]);
      }
      onClose();
    } catch (error) {
      console.error("Error updating bundle:", error);
      alert("Error updating bundle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Edit className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Edit Bundle Arrival
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Lorry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lorry Type *
              </label>
              <select
                value={formData.lorry_type}
                onChange={(e) =>
                  handleInputChange("lorry_type", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lorry_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Lorry Type</option>
                {lorryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.lorry_type && (
                <p className="text-red-500 text-sm mt-1">{errors.lorry_type}</p>
              )}
            </div>

            {/* Lorry No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LR No *
              </label>
              <input
                type="text"
                value={formData.lorry_no}
                onChange={(e) => handleInputChange("lorry_no", e.target.value)}
                placeholder="Enter lorry receipt number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lorry_no ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lorry_no && (
                <p className="text-red-500 text-sm mt-1">{errors.lorry_no}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            {/* Party Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Name *
              </label>
              <input
                type="text"
                value={formData.party_name}
                onChange={(e) =>
                  handleInputChange("party_name", e.target.value)
                }
                placeholder="Enter party name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.party_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.party_name && (
                <p className="text-red-500 text-sm mt-1">{errors.party_name}</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                A/c *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {accountTypes.map((account) => (
                  <button
                    key={account.value}
                    type="button"
                    onClick={() =>
                      handleInputChange("account_type", account.value)
                    }
                    className={`p-2 text-center rounded-md border-2 transition-colors ${
                      formData.account_type === account.value
                        ? `${account.color} border-blue-500`
                        : "bg-white border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
              {errors.account_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.account_type}
                </p>
              )}
            </div>

            {/* Bundle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle *
              </label>
              <input
                type="text"
                value={formData.bundle}
                onChange={(e) => handleInputChange("bundle", e.target.value)}
                placeholder="Enter bundle details"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bundle ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bundle && (
                <p className="text-red-500 text-sm mt-1">{errors.bundle}</p>
              )}
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice No *
              </label>
              <input
                type="text"
                value={formData.invoice_no}
                onChange={(e) =>
                  handleInputChange("invoice_no", e.target.value)
                }
                placeholder="Enter invoice number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.invoice_no ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.invoice_no && (
                <p className="text-red-500 text-sm mt-1">{errors.invoice_no}</p>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  handleInputChange("invoice_date", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.invoice_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.invoice_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoice_date}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="Enter amount"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Phone Number - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PH NO
              </label>
              <input
                type="tel"
                value={formData.phone_no}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                placeholder="Enter phone number (optional)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone_no ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone_no && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_no}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STATUS *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* Itemtype */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itemtype
              </label>
              <input
                type="text"
                value={formData.itemtype}
                onChange={(e) => handleInputChange("itemtype", e.target.value)}
                placeholder="Enter item type (optional)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.itemtype ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.itemtype && (
                <p className="text-red-500 text-sm mt-1">{errors.itemtype}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Updating..." : "Update Entry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
