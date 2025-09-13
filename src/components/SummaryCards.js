import React from "react";
import {
  TrendingUp,
  Truck,
  Users,
  DollarSign,
  Calendar,
  Wallet,
} from "lucide-react";
import { calculateTotalAmount, filterData, getMonthlyTotals } from "../utils";

const SummaryCards = ({ data, filters }) => {
  const filteredData = filterData(data, filters);
  const monthlyTotals = getMonthlyTotals(data);

  const totalAmount = calculateTotalAmount(filteredData);
  const totalEntries = filteredData.length;

  // Calculate unique counts
  const uniqueLorries = [
    ...new Set(filteredData.map((item) => item.lorry_type)),
  ].length;
  const uniqueParties = [
    ...new Set(filteredData.map((item) => item.party_name)),
  ].length;

  // Calculate account type breakdown (for future use)
  // const accountBreakdown = filteredData.reduce((acc, item) => {
  //   acc[item.account_type] = (acc[item.account_type] || 0) + 1
  //   return acc
  // }, {})

  const cards = [
    {
      title: "Total Entries",
      value: totalEntries,
      icon: TrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "Total Purchase (All Time)",
      value: `₹${monthlyTotals.totalPurchase.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      title: "This Month Total",
      value: `₹${monthlyTotals.currentMonthTotal.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: Calendar,
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Opening Balance",
      value: `₹${monthlyTotals.openingBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: Wallet,
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <div
              className={`p-2 sm:p-3 rounded-full ${card.color} bg-opacity-10`}
            >
              <card.icon
                className={`w-4 h-4 sm:w-6 sm:h-6 ${card.textColor}`}
              />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                {card.title}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
