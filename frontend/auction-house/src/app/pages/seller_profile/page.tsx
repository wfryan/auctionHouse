'use client';
import React from 'react';

const SellerProfile = () => {
  // Dummy data, eventually use Lambda Functions to retrieve information
  const userData = {
    username: "JohnDoe123",
    description: "Professional seller since 2020. Specializing in electronics and accessories.",
    balance: "$1,234.56"
  };


  // Function to go back to the previous page
  const handleBackButton = () => {
    window.location.href = '/pages/auction_dashboard';
  };

  return (
    <div className="p-4 md:p-5 font-sans max-w-7xl mx-auto">
      <div className="mb-6">
        {/* Back Button */}


        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-5">
          Seller Profile Page
        </h1>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 md:p-5 bg-white">
        <button
          onClick={handleBackButton}
          className="px-4 py-2 text-sm text-black border-2 border-black rounded-md mb-4 hover:bg-gray-100"
        >
          Back
        </button>
        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
          {/* Left side - User Information */}
          <div className="w-full md:w-3/5 space-y-3">
            <div className="bg-gray-100 p-3 rounded-md text-black">
              {userData.username}
            </div>

            <div className="bg-gray-100 p-3 rounded-md min-h-16 text-black">
              {userData.description}
            </div>

            <div className="bg-gray-100 p-3 rounded-md text-black">
              {userData.balance}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-3">
            <button
              onClick={() => alert("Unfreeze Requested")}
              className="px-4 py-2 bg-white border-2 border-black rounded-md cursor-pointer w-full md:w-40 hover:bg-blue-50 text-black text-sm md:text-base"
            >
              Unfreeze Request
            </button>

            <button
              onClick={() => alert("Close Account Requested")}
              className="px-4 py-2 bg-white border-2 border-black rounded-md cursor-pointer w-full md:w-40 hover:bg-red-50 text-black text-sm md:text-base"
            >
              Close Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
