import React, { useState } from "react";
import { supabase } from "../supabase";

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult("Testing connection...");

    try {
      // Test 1: Check environment variables
      const url = process.env.REACT_APP_SUPABASE_URL;
      const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setTestResult(
          "❌ Missing environment variables. Check your .env file."
        );
        return;
      }

      // Test 1.5: Check Supabase client
      if (!supabase) {
        setTestResult("❌ Supabase client not initialized.");
        return;
      }

      // Test 2: Check if we can connect
      const { error } = await supabase
        .from("bundle_arrivals")
        .select("count")
        .limit(1);

      if (error) {
        if (error.code === "PGRST116") {
          setTestResult(
            '❌ Table "bundle_arrivals" does not exist. Please run the SQL schema first.'
          );
        } else if (error.code === "PGRST301") {
          setTestResult(
            "❌ Row Level Security (RLS) is enabled but no policies exist. Please check your RLS policies."
          );
        } else if (error.code === "PGRST301") {
          setTestResult("❌ Authentication failed. Check your API key.");
        } else {
          setTestResult(
            `❌ Connection error: ${error.message} (Code: ${error.code})`
          );
        }
      } else {
        setTestResult("✅ Connection successful! Database is working.");
      }
    } catch (err) {
      setTestResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Supabase Connection Test
      </h3>
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>
      {testResult && (
        <div className="mt-3 p-3 bg-white rounded border">
          <p className="text-sm">{testResult}</p>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
