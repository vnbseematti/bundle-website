import React, { useState, useEffect } from "react";
import { Plus, Save, X } from "lucide-react";
import { supabase } from "../supabase";
import { validateFormData } from "../utils";

const BundleForm = ({ onDataAdded, partyNames, cityNames = [], data, user }) => {
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
    status: "",
    itemtype: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCitySuggestions, setFilteredCitySuggestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

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
    { value: "", label: "" },
    { value: "OPEN", label: "OPEN" },
    { value: "PENDING", label: "PENDING" },
  ];

  // Handle party name suggestions
  useEffect(() => {
    if (formData.party_name && partyNames.length > 0) {
      const filtered = partyNames.filter((name) =>
        name.toLowerCase().includes(formData.party_name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      console.log("Party suggestions:", filtered); // Debug log
    } else {
      setShowSuggestions(false);
    }
  }, [formData.party_name, partyNames]);

  // Handle city suggestions
  useEffect(() => {
    if (formData.city && cityNames.length > 0) {
      const filtered = cityNames.filter((name) =>
        name.toLowerCase().includes(formData.city.toLowerCase())
      );
      setFilteredCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setShowCitySuggestions(false);
    }
  }, [formData.city, cityNames]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({ ...prev, party_name: suggestion }));
    setShowSuggestions(false);

    // Auto-fill phone number if party exists in data
    if (data && data.length > 0) {
      const partyData = data.find((item) => item.party_name === suggestion);
      if (partyData && partyData.phone_no) {
        setFormData((prev) => ({ ...prev, phone_no: partyData.phone_no }));
      }
    }
  };

  const handleCitySuggestionClick = (suggestion) => {
    setFormData((prev) => ({ ...prev, city: suggestion }));
    setShowCitySuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFormData(formData, data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage(""); // Clear success message on validation error
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("bundle_arrivals")
        .insert([
          {
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
          },
        ])
        .select();

      if (error) throw error;

      // Reset form
      setFormData({
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
      setErrors({});
      setSuccessMessage("Entry added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      if (onDataAdded) {
        onDataAdded(data[0]);
      }
    } catch (error) {
      console.error("Error adding bundle:", error);
      setErrors({ general: "Error adding bundle. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Bundle Arrival Details
        </h2>
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Add New Entry</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-600 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Display */}
        {(errors.duplicate || errors.general) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm font-medium">
              {errors.duplicate || errors.general}
            </p>
          </div>
        )}

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
              onChange={(e) => handleInputChange("lorry_type", e.target.value)}
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
          <div className="relative">
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
            {showCitySuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredCitySuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCitySuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          {/* Party Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Name *
            </label>
            <input
              type="text"
              value={formData.party_name}
              onChange={(e) => handleInputChange("party_name", e.target.value)}
              placeholder="Enter party name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.party_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
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
              <p className="text-red-500 text-sm mt-1">{errors.account_type}</p>
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
              onChange={(e) => handleInputChange("invoice_no", e.target.value)}
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
              <p className="text-red-500 text-sm mt-1">{errors.invoice_date}</p>
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

          {/* Phone Number - Moved to last position and made optional */}
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
              STATUS (optional)
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
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
              setErrors({});
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {isSubmitting ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BundleForm;
