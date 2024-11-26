'use client';
import React, { Suspense, useEffect, useState } from 'react';
import axios from "axios";
import { useRouter, useSearchParams } from 'next/navigation';
import EditAuction from '../components/EditAuction';
const instance = axios.create({
  baseURL: "https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse"
})

class Auction {
  auction_id: number
  item_name: string
  item_starting_price: number
  item_start_time: string
  item_end_time:string
  item_information: string


  constructor(aid:number, name:string, starting_bid:number, start_time:string, end_time:string, info:string){
    this.auction_id=aid;
    this.item_name=name;
    this.item_starting_price = starting_bid;
    this.item_start_time=start_time;
    this.item_end_time=end_time;
    this.item_information=info;
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

  const searchParams = useSearchParams();

  const user = searchParams?.get('username'); // JohnDoe

  const appendedUrl = '?username=' + user;
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

  //State to track the auction being edited
  const [editingAuctionId, setEditingAuctionId] = useState<number | null>(null); 

  const toggleEditForm = (auctionId: number) => {
    setEditingAuctionId((current) => (current === auctionId ? null : auctionId));
  };

  //Handler for routing the user to the profile page
  const handleProfileClick = () => {
    router.push('/seller_profile' + appendedUrl)
    //window.location.href = '/pages/seller_profile' + appendedUrl;
  };

  //Handler for routing the user to the profile page
  const handleCreateAuction = () => {
    router.push('/create_auction' + appendedUrl)
    //window.location.href = '/pages/create_auction' + appendedUrl;
  };

  const publishAuction = async (auction_id: number) => {
    const payload = JSON.stringify({
      auctionId: auction_id
    });

    console.log(auction_id)
    try {
      const response = await instance.post('/auction/publish', payload);
      const status = response.data.statusCode;

      if (status === 200) {
        getAuctionInfo();
      }
      console.log(response)
    }
    catch (error) {
      console.log(error)
      alert("Error publishing auction")
    }

  };

  const getAuctionInfo = async () => {
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
          processedData[key] = auctionData[key].map((item: { auction_id: number, item_name: string, item_starting_price: number, item_start_time:string, item_end_time:string, item_information:string }) => ({
            auction_id: item.auction_id,
            item_name: item.item_name,
            item_starting_price: item.item_starting_price,
            item_start_time: item.item_start_time,
            item_end_time: item.item_end_time,
            item_information: item.item_information
          }));        });
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

  //Handler for Edit Auction Submission
  const handleEditSubmit = async(editedAuction: Auction, getAuctionInfo: () => void) => {
    try {
      const payload = JSON.stringify({
        "username" : user,
        "auctionId" : editedAuction.auction_id,
        "itemName" : editedAuction.item_name,
        "itemDescription" : editedAuction.item_information,
        "startingPrice" : editedAuction.item_starting_price,
        "startTime" : editedAuction.item_start_time,
        "endTime" : editedAuction.item_end_time
      });

      console.log(payload);
      const response = await axios.post('https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/auction/editAuctions', payload);
      let status = response.data.statusCode;

      if (status === 200) {
        console.log("Auction Updated Successfully!");
        getAuctionInfo();
        alert("Auction Updated Succesfully!")
      } else {
        console.log("Failed to update auction.");
        alert("Auction could not be updated.");
      }
    } catch (error) {
      console.log("Error Submitting the form: ", error);
      alert('There was an error updating the auction. Please try again.');
    }
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
            <div key={index} className="border-b last:border-b-0">
              {/* Auction item row */}
              <div className="p-4 flex justify-between items-center">
                <span>{item.item_name}</span>
                {isInactive && (
                  <div className="space-x-2">
                    <button
                      onClick={() => publishAuction(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => toggleEditForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm border border-black rounded hover:bg-red-500 hover:text-white hover:border-red-500">
                      Remove
                    </button>
                  </div>
                )}
              </div>
  
              {/* Edit form */}
              {editingAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <EditAuction
                    auctionId={item.auction_id}
                    itemName={item.item_name}
                    startingPrice={item.item_starting_price} // Replace with actual data
                    startTime={formatDateTime(item.item_start_time)} // Replace with actual data
                    endTime={formatDateTime(item.item_end_time)} // Replace with actual data
                    itemDescription={item.item_information}
                    onCancel={() => setEditingAuctionId(null)} // Close the form
                    onSubmit={(updatedAuction) => {
                      const convertedAuction = new Auction(
                        updatedAuction.auctionId,
                        updatedAuction.itemName,
                        updatedAuction.startingPrice,
                        updatedAuction.startTime,
                        updatedAuction.endTime,
                        updatedAuction.itemDescription
                      );

                      handleEditSubmit(convertedAuction, getAuctionInfo)}}
                  />
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