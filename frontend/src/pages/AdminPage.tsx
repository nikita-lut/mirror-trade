import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { ay } from "vitest/dist/reporters-yx5ZTtEV";
import { useAuth } from "../hooks/useAuth";

const AdminDashboard: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [totalUsdc, setTotalUsdc] = useState<number | string>("");
  const [allocations, setAllocations] = useState<string>("");
  const [rebalanceAllocations, setRebalanceAllocations] = useState<string>("");
  const [userProfitLoss, setUserProfitLoss] = useState<number>(0);

  const [holdings, setHoldings] = useState<any[]>([]);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserCount(response.data.userCount);
      setTotalProfitLoss(response.data.totalProfitLoss);
      setUserStats(response.data.userStats);
      setAllocations(JSON.stringify(response.data.stat.allocations));
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setHoldings(response.data.holdings);
      setUserProfitLoss(response.data.totalProfitLoss);
      setUsdcBalance(response.data.usdcBalance);
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle setting funds
  const handleSetFunds = async () => {
    try {
      await api.post(
        "/admin/funds",
        { totalUsdc },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Main account funds updated successfully");
      fetchDashboardData();
      fetchUserData();
    } catch (error) {
      console.error("Error updating funds", error);
      alert("Failed to update funds");
    }
  };

  const handleAllocationsChange = (e: any) => {
    // const _alloc = JSON.parse(e.target.value);
    // console.log(_alloc, e.target.value);
    setAllocations(e.target.value);
  };
  // Handle allocating coins
  const handleAllocateCoins = async () => {
    try {
      await api.post(
        "/admin/allocate",
        { allocations: JSON.parse(allocations) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Allocations updated successfully");
    } catch (error) {
      console.error("Error allocating coins", error);
      alert("Failed to allocate coins");
    }
  };

  const handleRebalanceFundsChange = (e: any) => {
    setRebalanceAllocations(e.target.value);
  };

  // Handle rebalancing funds
  const handleRebalanceFunds = async () => {
    try {
      await api.post(
        "/admin/rebalance",
        { allocations: JSON.parse(rebalanceAllocations) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchDashboardData();
      fetchUserData();
      alert("Funds rebalanced successfully");
    } catch (error) {
      console.error("Error rebalancing funds", error);
      alert("Failed to rebalance funds");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
    const userInterval = setInterval(fetchUserData, 5000);
    const adminInterval = setInterval(fetchDashboardData, 5000);
    return () => {
      clearInterval(userInterval);
      clearInterval(adminInterval); // Clear the interval when the component unmounts
    };
  }, []);

  // Handle liquidation of all holdings
  const handleLiquidate = async () => {
    try {
      await api.post(
        "/user/liquidate",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("All holdings liquidated successfully");
      // Refresh the dashboard data
      // window.location.reload();
      fetchUserData();
      fetchDashboardData();
    } catch (error) {
      console.error("Error liquidating holdings", error);
      alert("Failed to liquidate holdings");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="flex gap-4">
        {user && user.role === "admin" && (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl">Follower Count: {userCount}</h2>
              <h2 className="text-xl">
                Total Profit/Loss: ${Number(totalProfitLoss.toFixed(4))}
              </h2>
            </div>
            <h2 className="text-lg font-semibold">Follower Stats:</h2>
            <div className="mb-4">
              <table className="table-auto w-full text-base text-left text-gray-700">
                <thead className="text-base text-gray-900 uppercase bg-gray-50 ">
                  <tr className="border-b">
                    <th scope="col" className="px-6 py-3">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Funds(USDC)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((user) => (
                    <tr className="bg-white" key={user.id}>
                      <td className="px-6 py-4">{user.id}</td>
                      <td className="px-6 py-4">
                        {Number(Number(user.usdcBalance).toFixed(4))}
                      </td>
                      <td className="px-6 py-4">
                        ${Number(user.profitLoss.toFixed(4))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Allocate Coins</h2>
              <input
                placeholder="Enter allocations as JSON e.g. { 'BTC': 50, 'ETH': 30, 'LTC': 20 }"
                onChange={handleAllocationsChange}
                className="border p-2 rounded mb-2 w-full"
                value={allocations}
              />
              <button
                onClick={handleAllocateCoins}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Allocate Coins
              </button>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Rebalance Funds</h2>
              <input
                placeholder="Enter new allocations for rebalancing as JSON e.g. { 'BTC': 60, 'ETH': 30, 'LTC': 10 }"
                onChange={handleRebalanceFundsChange}
                className="border p-2 rounded mb-2 w-full"
              />
              <button
                onClick={handleRebalanceFunds}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Rebalance Funds
              </button>
            </div>
          </div>
        )}

        <div className="w-full">
          <h2 className="text-xl">
            USDC Balance: ${Number(Number(usdcBalance).toFixed(4))}
          </h2>
          <h2 className="text-xl">
            Total Profit/Loss: ${Number(userProfitLoss.toFixed(4))}
          </h2>

          <h2 className="text-lg font-semibold mt-6">Current Holdings:</h2>
          <table className="table-auto w-full text-base text-left text-gray-700">
            <thead className="text-base text-gray-900 uppercase bg-gray-50 ">
              <tr className="border-b">
                <th scope="col" className="px-6 py-3">
                  Coin
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Profit/Loss
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr className="bg-white" key={holding.coin}>
                  <td className="px-6 py-4">
                    {holding.coin}({JSON.parse(allocations || "")[holding.coin]}
                    %)
                  </td>
                  <td className="px-6 py-4">
                    {Number(Number(holding.amount).toFixed(6))}
                  </td>
                  <td className="px-6 py-4">
                    ${Number(holding.profitLoss.toFixed(4))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleLiquidate}
            className="bg-red-500 text-white p-2 rounded mt-4 mb-6"
          >
            Liquidate All Holdings
          </button>
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Set Funds</h2>
            <input
              type="number"
              value={totalUsdc}
              onChange={(e) => setTotalUsdc(e.target.value)}
              placeholder="Total USDC"
              className="border p-2 rounded mr-2"
            />
            <button
              onClick={handleSetFunds}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Update Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
