import React from "react";

export type AuctionData = {
  itemName: string;
  soldPrice: number;
  buyerUsername: string;
};

type AuctionReportProps = {
  data: AuctionData[]; // Array of auction data to display
  onClose: () => void; // Callback function to close the report
};

const AuctionReport: React.FC<AuctionReportProps> = ({ data, onClose }) => {
  // Calculate the total auction house funds (5% of total sales)
  const totalFunds = data.reduce((acc, item) => acc + item.soldPrice, 0) * 0.05;

  return (
    <div className="p-5 font-sans bg-white shadow-lg rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">Auction Report</h2>
        <button 
          onClick={onClose} 
          className="text-black hover:text-red-500 transition-colors duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left text-black">Item Name</th>
              <th className="border border-black p-2 text-left text-black">Sold Price</th>
              <th className="border border-black p-2 text-left text-black">Buyer Username</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                className="hover:bg-white hover:border-black transition-colors duration-200 text-black"
              >
                <td className="border border-black p-2">{item.itemName}</td>
                <td className="border border-black p-2">{item.soldPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
                <td className="border border-black p-2">{item.buyerUsername}</td>
              </tr>
            ))}
            {/* Final row for total funds */}
            <tr className="font-bold">
              <td colSpan={2} className="border border-black p-2 text-right text-black">
                Total Auction House Funds (5%):
              </td>
              <td className="border border-black p-2 text-black">
                {totalFunds.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionReport;