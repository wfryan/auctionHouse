'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { instance, header } from '../utils/auctionHouseApi';
import { removeToken, getToken } from '../utils/cookie';
import { decodeToken, getUsername } from '../utils/jwt';
import SignOutButton from '../components/SignoutButton';

class Bid {
  auction_id: number
  bid_id: number
  buyer_id: number
  amount: number
  bid_time: string
  is_highest_bid: boolean
  item_name: string
  auction_status: string

  constructor(aid: number, bid: number, buy: number, amt: number, btime: string, highbid: number, itemName:string, astatus: string) {
    this.auction_id = aid;
    this.bid_id = bid;
    this.buyer_id = buy;
    this.amount = amt;
    this.bid_time = btime;
    this.is_highest_bid = highbid === 1 ? true : false
    this.item_name = itemName
    this.auction_status = astatus
  }
}

// Update interface to include isInactive prop
interface BidTableProps {
  title: string;
  items: Bid[];
  status: bidStatus;
}

enum bidStatus {
  winning,
  trailing,
  completed,
  failed
}

const BuyerDashboard = () => {
  const router = useRouter();
  const user = getUsername()

  // Dummy data for different auction categories

  const [bidData, setBidData] = useState<Record<string, Bid[]>>({
    winning: [],
    trailing: [],
    completed: [],
    failed: []
  });

  //Handler for routing the user to the profile page
  const handleProfileClick = () => {
    router.push('/buyer_profile')
  };

  const handleSearchClick = () => {
    router.push("/search")
  }

  const viewItem = (itemId: number) => {
    localStorage.setItem("id", itemId.toString())
    router.push("/auction_page")
  }

  const getBidInfo = async () => {
    let tkn = getToken();
    if (tkn !== null) {
      console.log(decodeToken(tkn))
    }

    const functionInput = JSON.stringify({
      username: user,
      token: `Bearer ${getToken()}`
    });

    try {
      const response = await instance.post('/users/reviewBids', functionInput);
      const status = response.data.statusCode;
      console.log(response);

      if (status === 200) {
        console.log("hi")
        const bidData = response.data.body;
        console.log(response.data.body);

        const processedData: Record<string, Bid[]> = {};

        Object.keys(bidData).forEach((key) => {
          processedData[key] = bidData[key].map(
            (item: {
              auction_id: number;
              bid_id: number;
              buyer_id: number;
              amount: number;
              bid_time: string; // Assuming bid time is a string in the input
              is_highest_bid: number; // 1 for true, 0 for false
              item_name: string;
              auction_status: string
            }) =>
            ({
                auction_id: item.auction_id,
                bid_id: item.bid_id,
                buyer_id: item.buyer_id,
                amount: item.amount,
                bid_time: item.bid_time, 
                is_highest_bid: item.is_highest_bid,
                item_name: item.item_name,
                auction_status: item.auction_status
        }));
        });
        console.log(processedData)
        console.log("got here")
        setBidData(processedData);
        console.log("got here?")



      } else {
        // Handle any other status codes appropriately
        alert('Error: ' + response.data.body); // Adjust based on your response structure
      }
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    getBidInfo();
  }, []);

  // Format the start and end times to match the input type "datetime-local"
  // Additional functionality to handle instances where there is no start time or end time for auctions.
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const utcDate = new Date(dateTime);
    if (isNaN(utcDate.getTime()) || utcDate.getFullYear() <= 1970) return '';

    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    const hours = String(utcDate.getUTCHours()).padStart(2, '0');
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Component for individual auction table
  const BidTable: React.FC<BidTableProps> = ({ title, items, status }) => (
    <div className="mb-6">
      <div className="bg-gray-100 p-3 rounded-t-md font-medium text-black">
        {title}
      </div>
      <div className="border border-gray-300 rounded-b-md">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="border-b last:border-b-0">
              {/* Bidrow */}
              <div className="p-4 flex justify-between items-center">
                <span>{item.item_name}</span>
                {status=== bidStatus.completed &&(
                  <div>
                    <label hidden={item.auction_status !== "archived"}> Item has been purchased and fulfilled! </label>
                    <label hidden={item.auction_status === "archived"}> Item has been purchased and awaiting fulfillment! </label>
                  </div>
                  )}
                  <div className="space-x-2">
                    <button
                      onClick={() => viewItem(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                  </div>

              </div>
            </div>
            
          ))
        ) : (
          <div className="p-4 text-gray-500 italic">No Bids found</div>
        )}
      </div>
    </div>
  );

  return (
    <Suspense>
      <div className="p-4 md:p-5 font-sans max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Buyer Dashboard</h1>
          <div className="flex space-x-4">
          <button
              onClick={handleSearchClick}
              className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
            >
              Search
            </button>
            <button
              onClick={handleProfileClick}
              className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
            >
              Profile
            </button>
            <SignOutButton />
          </div>
        </div>
        <div className="space-y-6">
          <BidTable title="WINNING" items={bidData.winning} status={bidStatus.winning} />
          <BidTable title="BOUGHT" items={bidData.completed} status={bidStatus.completed} />
          <BidTable title="FAILED" items={bidData.failed} status={bidStatus.failed} />
          <BidTable title="TRAILING" items={bidData.trailing} status={bidStatus.trailing} />
        </div>
      </div>
    </Suspense>
  );
};

const BuyerDashboardWrapper = () => {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <BuyerDashboard />
    </Suspense>
  );
}

export default BuyerDashboardWrapper;