'use client';
import React from 'react';

// Update interface to include isInactive prop
interface AuctionTableProps {
  title: string;
  items: string[];
  isInactive: boolean;
}

const AuctionDashboard = () => {
  // Dummy data for different auction categories
  const auctionData: Record<string, string[]> = {
    inactive: ["Vintage Watch Auction", "Antique Furniture Sale"],
    active: ["Electronics Clearance", "Collectible Cards Bundle"],
    failed: ["Holiday Decorations Lot"],
    completed: ["Sports Memorabilia", "Rare Books Collection"],
    archived: ["Summer Fashion Items", "Garden Tools Set"],
    frozen: ["Jewelry Collection"]
  };

  //Handler for routing the user to the profile page
  const handleProfileClick = () => {
    window.location.href = '/seller/seller_profile';
  };

  //Handler for routing the user to the profile page
  const handleCreateAuction = () => {
    window.location.href = '/seller/create_auction';
  };

  // Component for individual auction table
  const AuctionTable: React.FC<AuctionTableProps> = ({ title, items, isInactive }) => (
    <div className="mb-6">
      <div className="bg-gray-100 p-3 rounded-t-md font-medium text-black">
        {title}
      </div>
      <div className="border border-gray-300 rounded-b-md">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="p-4 border-b last:border-b-0 flex justify-between items-center">
              <span>{item}</span>
              {isInactive && (
                <div className="space-x-2">
                  <button className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm border border-black rounded hover:bg-red-500 hover:text-white hover:border-red-500">
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500 italic">No auctions found</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-5 font-sans max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Auction Dashboard</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleProfileClick}
            className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
          >
            Profile
          </button>
          <button 
            onClick={handleCreateAuction}
            className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
          >
            Create New Auction
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <AuctionTable title="INACTIVE" items={auctionData.inactive} isInactive={true} />
        <AuctionTable title="ACTIVE" items={auctionData.active} isInactive={false} />
        <AuctionTable title="FAILED" items={auctionData.failed} isInactive={false} />
        <AuctionTable title="COMPLETED" items={auctionData.completed} isInactive={false} />
        <AuctionTable title="ARCHIVED" items={auctionData.archived} isInactive={false} />
        <AuctionTable title="FROZEN" items={auctionData.frozen} isInactive={false} />
      </div>
    </div>
  );
};

export default AuctionDashboard;