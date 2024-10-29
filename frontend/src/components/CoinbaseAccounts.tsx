import React, { useEffect, useState } from "react";
import axios from "axios";

const CoinbaseAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/api/coinbase/accounts"); // Ensure this endpoint exists
        setAccounts(response.data.data); // Adjust based on your API response structure
      } catch (error) {
        console.error("Error fetching Coinbase accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div>
      <h2>Your Coinbase Accounts</h2>
      <ul>
        {accounts.map((account) => (
          <li key={account.id}>
            {account.name}: {account.balance.amount} {account.balance.currency}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoinbaseAccounts;
