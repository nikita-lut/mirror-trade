import React from "react";
const Home: React.FC = () => {
  // useEffect(() => {
  //   if (user && user.token) {
  //     navigate("");
  //   }
  // }, [user]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">
        Welcome to the Coinbase Account Mirroring System
      </h1>
      <p>This is your home page.</p>
    </div>
  );
};

export default Home;
