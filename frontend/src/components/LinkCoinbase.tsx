import React from "react";

const LinkCoinbase: React.FC = () => {
  const handleLinkCoinbase = () => {
    const clientId = "YOUR_CLIENT_ID"; // Replace with your Client ID
    const redirectUri = "http://localhost:5000/auth/callback"; // Your redirect URI
    const scopes = "wallet:accounts:read,wallet:transactions:read"; // Adjust scopes as necessary

    const authUrl = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = authUrl; // Redirect user to Coinbase authorization
  };

  return (
    <div>
      <h2>Link Your Coinbase Account</h2>
      <button onClick={handleLinkCoinbase}>Link Coinbase</button>
    </div>
  );
};

export default LinkCoinbase;
