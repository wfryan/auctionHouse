'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { instance, header } from '../utils/auctionHouseApi';
import { removeToken, getToken } from '../utils/cookie';
import { decodeToken, getUsername } from '../utils/jwt';
import SignOutButton from '../components/SignoutButton';
import EditAuction from '../components/EditAuction';
import RequestUnfreeze from '../components/RequestUnfreeze';

class Auction {
  auction_id: number
  item_name: string
  item_starting_price: number
  item_start_time: string
  item_end_time: string
  item_information: string
  auction_type: string


  constructor(aid: number, name: string, starting_bid: number, start_time: string, end_time: string, info: string, auctionType: string) {
    this.auction_id = aid;
    this.item_name = name;
    this.item_starting_price = starting_bid;
    this.item_start_time = start_time;
    this.item_end_time = end_time;
    this.item_information = info;
    this.auction_type = auctionType;
  }
}

enum status {
  Inactive,
  Active,
  Completed,
  Failed,
  Archived,
  Frozen,
}

// Update interface to include isInactive prop
interface AuctionTableProps {
  title: string;
  items: Auction[];
  itemStatus: status;
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

  //State to track the auction being edited
  const [editingAuctionId, setEditingAuctionId] = useState<number | null>(null);
  const [frozenAuctionId, setFrozenAuctionId] = useState<number | null>(null);

  const toggleEditForm = (auctionId: number) => {
    setEditingAuctionId((current) => (current === auctionId ? null : auctionId));
  };

  const toggleFrozenForm = (auctionId: number) => {
    setFrozenAuctionId((current) => (current === auctionId ? null : auctionId));
  }

  //Handler for routing the user to the profile page
  const handleProfileClick = () => {
    router.push('/seller_profile')
  };

  //Handler for routing the user to the profile page
  const handleCreateAuction = () => {
    router.push('/create_auction')
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

  const unpublishAuction = async (auction_id: number) => {
    const payload = JSON.stringify({
      auctionId: auction_id,
      token: `Bearer ${getToken()}`
    });

    console.log(auction_id)
    try {
      const response = await instance.post('/auction/unpublish', payload);
      const status = response.data.statusCode;

      if (status === 200) {
        getAuctionInfo();
      }
      if (status === 400) {
        alert(response.data.body)
      }
      console.log(response)
      if (status === 418) {
        //router.push('/login')
      }
    }
    catch (error) {
      console.log(error)
      alert("Error unpublishing auction")
    }

  };

  const getAuctionInfo = async () => {
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
          processedData[key] = auctionData[key].map((item: { auction_id: number, item_name: string, item_starting_price: number, item_start_time: string, item_end_time: string, item_information: string, auctionType: boolean }) => ({
            auction_id: item.auction_id,
            item_name: item.item_name,
            item_starting_price: item.item_starting_price,
            item_start_time: item.item_start_time,
            item_end_time: item.item_end_time,
            item_information: item.item_information,
            auction_type: item.auctionType ? "buyNow" : "auction"
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

  // Format the start and end times to match the input type "datetime-local"
  // Additional functionality to handle instances where there is no start time or end time for auctions.
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const localDate = new Date(dateTime); // This will automatically convert the UTC date to local time
    
    if (isNaN(localDate.getTime()) || localDate.getFullYear() <= 1970) return '';

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  //Handler for Edit Auction Submission
  const handleEditSubmit = async (editedAuction: Auction) => {
    try {
      const payload = JSON.stringify({
        "username": user,
        "auctionId": editedAuction.auction_id,
        "itemName": editedAuction.item_name,
        "itemDescription": editedAuction.item_information,
        "startingPrice": editedAuction.item_starting_price,
        "startTime": editedAuction.item_start_time,
        "endTime": editedAuction.item_end_time,
        "auctionType": editedAuction.auction_type === "buyNow" ? true : false,
      });

      console.log(payload);
      const response = await instance.post('auction/editAuctions', payload);
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

  //Handler for Request Unfreeze Submission
  const handleRequestUnfreeze = async(auctionId: number, reason: string, timestamp: string) => {
    try {
      const payload = JSON.stringify({
        "auctionId" : auctionId, 
        "reason" : reason, 
        "date" : timestamp, 
        "token" : `Bearer ${getToken()}`
      });

      const response = await instance.post('auction/requestUnfreeze', payload);
      let status = response.data.statusCode;

      if (status === 200) {
        console.log("Request Submitted Succesfully");
        getAuctionInfo();
        alert("Request submitted succesfully");
      } else if (status === 400) {
        alert("A request has already been made for this item.")
      }
      else {
        alert("Request did not submit.")
      }
    } catch (error) {
      console.log("Error requesting unfreeze: ", error);
    } 
  };

  // Component for individual auction table
  const AuctionTable: React.FC<AuctionTableProps> = ({ title, items, itemStatus }) => (
    <div className="mb-6">
      <div className="bg-gray-100 p-3 rounded-t-md font-medium text-black">{title}</div>
      <div className="border border-gray-300 rounded-b-md">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.auction_id} className="border-b last:border-b-0">
              <div className="p-4 flex justify-between items-center">
                <span>{item.item_name}</span>
                {itemStatus === status.Inactive && (
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
                {itemStatus === status.Active && (
                  <div className="space-x-2">
                    <button
                      onClick={() => unpublishAuction(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Unpublish
                    </button>
                  </div>
                )}
                {itemStatus === status.Frozen && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleFrozenForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Request Unfreeze
                    </button>
                  </div>
                )}
              </div>
              {/* EDITING AUCTIONS FORM */}
              {editingAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <EditAuction
                    auctionId={item.auction_id}
                    itemName={item.item_name}
                    startingPrice={item.item_starting_price}
                    startTime={formatDateTime(item.item_start_time)}
                    endTime={formatDateTime(item.item_end_time)}
                    itemDescription={item.item_information}
                    auctionType={item.auction_type}
                    onCancel={() => setEditingAuctionId(null)} // Close the form
                    onSubmit={(updatedAuction) => {
                      const convertedAuction = new Auction(
                        updatedAuction.auctionId,
                        updatedAuction.itemName,
                        updatedAuction.startingPrice,
                        updatedAuction.startTime,
                        updatedAuction.endTime,
                        updatedAuction.itemDescription,
                        updatedAuction.auctionType
                      );
                      handleEditSubmit(convertedAuction);
                    }}
                  />
                </div>
              )}
              {frozenAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <RequestUnfreeze
                    onCancel={() => setFrozenAuctionId(null)}
                    onSubmit={(reason, timestamp) => {
                      const formattedTimestamp = formatDateTime(timestamp);
                      handleRequestUnfreeze(item.auction_id, reason, formattedTimestamp);
                    }}
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
            <button onClick={handleProfileClick} className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black">
              Profile
            </button>
            <button onClick={handleCreateAuction} className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black">
              Create New Auction
            </button>
            <SignOutButton />
          </div>
        </div>
        <div className="space-y-6">
          <AuctionTable title="UNLISTED" items={auctionData.unlisted} itemStatus={status.Inactive} />
          <AuctionTable title="ACTIVE" items={auctionData.active} itemStatus={status.Active} />
          <AuctionTable title="COMPLETED" items={auctionData.bought} itemStatus={status.Completed} />
          <AuctionTable title="FAILED" items={auctionData.failed} itemStatus={status.Failed} />
          <AuctionTable title="ARCHIVED" items={auctionData.archived} itemStatus={status.Archived} />
          <AuctionTable title="FROZEN" items={auctionData.frozen} itemStatus={status.Frozen} />
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