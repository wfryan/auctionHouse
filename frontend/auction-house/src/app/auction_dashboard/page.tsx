'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { instance, header } from '../utils/auctionHouseApi';
import { removeToken, getToken } from '../utils/cookie';
import { decodeToken, getUsername } from '../utils/jwt';

class Auction {
  auction_id: number
  item_name: string

  constructor(aid: number, name: string) {
    this.auction_id = aid;
    this.item_name = name;
  }
}

// Update interface to include isInactive prop
interface AuctionTableProps {
  title: string;
  items: Auction[];
  isInactive: boolean;
}


const AuctionDashboard = () => {
  const router = useRouter();


  const user = getUsername()

  // Dummy data for different auction categories

  const [auctionData, setAuctionData] = useState<Record<string, Auction[]>>({
    unlisted: [],
    active: [],
    bought: [],
    failed: [],
    completed: [],
    archived: [],
    frozen: []
  });


  //Handler for routing the user to the profile page
  const handleProfileClick = () => {
    router.push('/seller_profile')
    //window.location.href = '/pages/seller_profile' + appendedUrl;
  };

  //Handler for routing the user to the profile page
  const handleCreateAuction = () => {
    router.push('/create_auction')
    //window.location.href = '/pages/create_auction' + appendedUrl;
  };

  const publishAuction = async (auction_id: number) => {
    const payload = JSON.stringify({
      auctionId: auction_id,
      token: `Bearer ${getToken()}`
    });

    console.log(auction_id)
    try {
      const response = await instance.post('/auction/publish', payload);
      const status = response.data.statusCode;




      if (status === 200) {
        getAuctionInfo();
      }
      console.log(response)
      if (status === 418) {
        //router.push('/login')
      }
    }
    catch (error) {
      console.log(error)
      alert("Error publishing auction")
    }

  };

  const getAuctionInfo = async () => {

    console.log(getToken())

    let tkn = getToken();
    if (tkn !== null) {
      console.log(decodeToken(tkn))
    }

    const functionInput = JSON.stringify({
      username: user
    });

    try {
      const response = await instance.post('/auction/reviewAuctions', functionInput);
      const status = response.data.statusCode;
      console.log(response);

      if (status === 200) {
        const auctionData = response.data.body;
        console.log(response.data.body);

        const processedData: Record<string, Auction[]> = {};

        Object.keys(auctionData).forEach(key => {
          processedData[key] = auctionData[key].map((item: { auction_id: number, item_name: string }) => ({
            auction_id: item.auction_id,
            item_name: item.item_name
          }));
        });
        console.log(processedData)
        console.log("got here")
        setAuctionData(processedData);
        console.log("got here?")



      } else {
        // Handle any other status codes appropriately
        alert('Error: ' + response.data.body); // Adjust based on your response structure
      }
    } catch (error) {
      console.log(error);
      alert('There was an error submitting the form. Please try again.');
    }
  }

  useEffect(() => {
    getAuctionInfo();
  }, []);

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
              <span>{item.item_name}</span>
              {isInactive && (
                <div className="space-x-2">
                  <button onClick={() => publishAuction(item.auction_id)} className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300">
                    Publish
                  </button>
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
    <Suspense>
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
          <AuctionTable title="UNLISTED" items={auctionData.unlisted} isInactive={true} />
          <AuctionTable title="ACTIVE" items={auctionData.active} isInactive={false} />
          <AuctionTable title="BOUGHT" items={auctionData.bought} isInactive={false} />
          <AuctionTable title="FAILED" items={auctionData.failed} isInactive={false} />
          <AuctionTable title="ARCHIVED" items={auctionData.archived} isInactive={false} />
          <AuctionTable title="FROZEN" items={auctionData.frozen} isInactive={false} />
        </div>
      </div>
    </Suspense>
  );
};

const AuctionDashboardWrapper = () => {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <AuctionDashboard />
    </Suspense>
  );
}

export default AuctionDashboardWrapper;