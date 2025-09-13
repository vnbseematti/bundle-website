
import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";
import { supabase } from "./supabase";
import { filterData, getUniquePartyNames, getUniqueCities } from "./utils";
import BundleForm from "./components/BundleForm";
import FilterPanel from "./components/FilterPanel";
import DataTable from "./components/DataTable";
import SummaryCards from "./components/SummaryCards";
import SupabaseTest from "./components/SupabaseTest";
import EditModal from "./components/EditModal";
import SimpleLogin from "./components/SimpleLogin";
import Toast from "./components/Toast";

function App() {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [partyNames, setPartyNames] = useState([]);
  const [cityNames, setCityNames] = useState([]);
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [lorryTypes] = useState([
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
  ]);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: bundleData, error } = await supabase
        .from("bundle_arrivals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData(bundleData || []);
      setPartyNames(getUniquePartyNames(bundleData || []));
      setCityNames(getUniqueCities(bundleData || []));
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      alert("Error loading data. Please check your Supabase configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchData();
    }
  }, []);

  // Handle new data added
  const handleDataAdded = (newEntry) => {
    setData((prev) => [newEntry, ...prev]);
    setPartyNames((prev) => {
      const newNames = [...prev, newEntry.party_name];
      return [...new Set(newNames)].sort();
    });
    setCityNames((prev) => {
      const newNames = [...prev, newEntry.city].filter(Boolean);
      return [...new Set(newNames)].sort();
    });
    // Show success toast
    setToast({
      show: true,
      message: "Bundle arrival entry created successfully!",
      type: "success",
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle edit entry
  const handleEdit = (item) => {
    setEditModal({ isOpen: true, item });
  };

  // Handle edit modal close
  const handleEditClose = () => {
    setEditModal({ isOpen: false, item: null });
  };

  // Handle edit update
  const handleEditUpdate = (updatedItem) => {
    setData((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    // Refresh party names
    const updatedData = data.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setPartyNames(getUniquePartyNames(updatedData));
    setCityNames(getUniqueCities(updatedData));
    // Show success toast
    setToast({
      show: true,
      message: "Bundle arrival entry updated successfully!",
      type: "success",
    });
  };

  // Handle login success
  const handleLoginSuccess = (user) => {
    setUser(user);
    fetchData(); // Fetch data after login
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setData([]);
  };

  // Handle delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("bundle_arrivals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setData((prev) => prev.filter((item) => item.id !== id));
      // Refresh party names
      const updatedData = data.filter((item) => item.id !== id);
      setPartyNames(getUniquePartyNames(updatedData));
      setCityNames(getUniqueCities(updatedData));
      // Show success toast
      setToast({
        show: true,
        message: "Bundle arrival entry deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      setToast({
        show: true,
        message: "Error deleting entry. Please try again.",
        type: "error",
      });
    }
  };

  // Get filtered data based on user role
  const getFilteredData = () => {
    let dataToFilter = data;

    // Staff (user role) can only see last 5 entries
    if (user && user.role === "user") {
      dataToFilter = data.slice(0, 5);
    }

    return filterData(dataToFilter, filters);
  };

  const filteredData = getFilteredData();

  // Show login form if user is not authenticated
  if (!user) {
    return <SimpleLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bundle arrival data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: "", type: "success" })
          }
        />
      )}
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/logo-icon.jpeg"
                alt="Vaniyambadiseematti Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Vaniyambadiseematti
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Database className="w-4 h-4" />
                <span>Bundle Management</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="hidden sm:block text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Connection Test */}
        <SupabaseTest />

        {/* Summary Cards - Hidden for staff (user role) */}
        {user && user.role !== "user" && (
          <SummaryCards data={data} filters={filters} />
        )}

        {/* Bundle Form */}
        <BundleForm
          onDataAdded={handleDataAdded}
          partyNames={partyNames}
          cityNames={cityNames}
          data={data}
          user={user}
        />

        {/* Filter Panel - Hidden for staff (user role) */}
        {user && user.role !== "user" && (
          <FilterPanel
            onFilterChange={handleFilterChange}
            partyNames={partyNames}
            lorryTypes={lorryTypes}
            isExpanded={filtersExpanded}
            setIsExpanded={setFiltersExpanded}
          />
        )}

        {/* Data Table */}
        <DataTable
          data={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          user={user}
          filtersExpanded={filtersExpanded}
        />

        {/* Edit Modal */}
        <EditModal
          isOpen={editModal.isOpen}
          onClose={handleEditClose}
          item={editModal.item}
          onUpdate={handleEditUpdate}
          partyNames={partyNames}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} Vaniyambadiseematti. All rights
              reserved.
            </p>
            <p className="mt-1">Bundle Arrival Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
