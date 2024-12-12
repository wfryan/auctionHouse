'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { instance } from '../utils/auctionHouseApi';
import { getToken } from '../utils/cookie';
import { decodeToken } from '../utils/jwt';
import SignOutButton from '../components/SignoutButton';
import ViewAuction from '../components/ViewAuction';
import ViewRequestUnfreeze from '../components/ViewRequestUnfreeze';
import { parse } from 'json2csv';

class Auction {
  auction_id: number
  item_name: string
  item_seller: string
  item_starting_price: number
  item_start_time: string
  item_end_time: string
  item_information: string
  unfreeze_request_timestamp: string
  unfreeze_request_description: string
  image_url?: string



  constructor(aid: number, name: string, item_seller: string, starting_bid: number, start_time: string, end_time: string, info: string, urt: string, urd: string, image_url?: string) {
    this.auction_id = aid;
    this.item_name = name;
    this.item_seller = item_seller;
    this.item_starting_price = starting_bid;
    this.item_start_time = start_time;
    this.item_end_time = end_time;
    this.item_information = info;
    this.unfreeze_request_timestamp = urt;
    this.unfreeze_request_description = urd;
    this.image_url = image_url;
  }
}

enum status {
  inactive,
  active,
  completed,
  failed,
  archived,
  frozen
}

// Update interface to include isInactive prop
interface AuctionTableProps {
  title: string;
  items: Auction[];
  itemStatus: status;
}


const AdminDashboard = () => {

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
  const [viewingAuctionId, setViewingAuctionId] = useState<number | null>(null);
  const [frozenAuctionId, setFrozenAuctionId] = useState<number | null>(null);

  const toggleViewForm = (auctionId: number) => {
    setViewingAuctionId((current) => (current === auctionId ? null : auctionId));
  };

  const toggleUnfreezeForm = (auctionId: number) => {
    setFrozenAuctionId((current) => (current === auctionId ? null : auctionId));
  };






  const getAuctionInfo = async () => {

    console.log(getToken())

    const tkn = getToken();
    if (tkn !== null) {
      console.log(decodeToken(tkn))
    }

    const functionInput = JSON.stringify({
      token: `Bearer ${getToken()}`
    });

    try {
      const response = await instance.post('/admin/getAllAuctions', functionInput);
      const status = response.data.statusCode;
      console.log(response);

      if (status === 200) {
        const auctionData = response.data.body;
        console.log(response.data.body);

        const processedData: Record<string, Auction[]> = {};

        Object.keys(auctionData).forEach(key => {
          processedData[key] = auctionData[key].map((item: {
            auction_id: number,
            item_picture: string,
            item_name: string,
            item_seller_id: number,
            item_seller: string,
            item_starting_price: number,
            item_start_time: string,
            item_end_time: string,
            item_information: string
            unfreeze_request_timestamp: string
            unfreeze_request_description: string
          }) => ({
            auction_id: item.auction_id,
            image_url: item.item_picture,
            item_name: item.item_name,
            item_seller: item.item_seller,
            item_starting_price: item.item_starting_price,
            item_start_time: item.item_start_time,
            item_end_time: item.item_end_time,
            item_information: item.item_information,
            unfreeze_request_timestamp: item.unfreeze_request_timestamp,
            unfreeze_request_description: item.unfreeze_request_description
          }));
        });
        console.log("processed-data")
        console.log(processedData)
        setAuctionData(processedData);



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

  //Handler for freeze auction

  const handleStatusChange = async (auction_id: number, status: string) => {
    const payload = JSON.stringify({
      auctionId: auction_id,
      status: status,
      token: `Bearer ${getToken()}`
    });

    console.log(auction_id)
    try {
      console.log("Here")
      const response = await instance.post('/admin/changeAuctionStatus', payload);
      console.log("NOw here")

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

  }


  const generateForensicsCSV = async () => {
    try {
      // Fetch the data from the backend
      const response = await instance.post('/admin/getForensics', JSON.stringify({
        token: `${getToken()}`
      }));

      // Log the full response to see the structure
      console.log("Full Response:", response);

      // Parse the response body since it's a string
      const responseBody = JSON.parse(response.data.body);

      console.log(responseBody)

      // Check if the response is successful and contains data
      if (response.data.statusCode === 200 && responseBody.data && Array.isArray(responseBody.data)) {
        const auctionData = responseBody.data;

        // Log the fetched data to verify its structure
        console.log("Fetched Data:", auctionData);

        // Check if auctionData is valid and not empty
        if (!auctionData || auctionData.length === 0) {
          console.error("No data available to generate CSV");
          return;
        }

        //The fields (columns) you want in the CSV
        const fields = [
          "auction_item_id", "item_name", "item_information", "item_picture", "auction_id", "starting_bid", "highest_bid", "status", "start_time",
          "end_time", "winner_id", "winning_bid_amount", "winner_username", "winner_location",
          "seller_username", "seller_location", "seller_balance", "bid_id", "bid_amount",
          "bid_time", "bid_is_buy_now", "bidder_username", "bidder_location"
        ];

        // Convert auction data to CSV
        const csv = parse(auctionData, { fields });

        // Create a Blob object with CSV data
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'forensics_report.csv';  // Set the file name
        document.body.appendChild(link);
        link.click();  // Trigger the download
        document.body.removeChild(link);  // Clean up the link

        alert("CSV file generated and download complete!");
      } else {
        console.error("Failed to fetch valid data for the CSV.");
      }
    } catch (error) {
      console.error('Error generating forensics CSV:', error);
    }
  };

  // Component for individual auction table
  const AuctionTable: React.FC<AuctionTableProps> = ({ title, items, itemStatus }) => (

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
                <div className="grid grid-cols-[150px_1fr] gap-4">
                  <span className="whitespace-nowrap">{"User: " + item.item_seller}</span>
                  <span className="whitespace-nowrap">{"Item: " + item.item_name}</span>
                </div>
                {itemStatus == status.inactive && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                  </div>
                )}
                {itemStatus == status.completed && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                  </div>
                )}
                {itemStatus == status.failed && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                  </div>
                )}
                {itemStatus == status.archived && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                  </div>
                )}
                {itemStatus == status.active && (
                  <div className="space-x-2">

                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.auction_id, 'frozen')}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-red-500 hover:text-white hover:border-red-500"
                    >

                      Freeze
                    </button>
                  </div>
                )}
                {itemStatus == status.frozen && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                    {item.unfreeze_request_description != null &&
                      <div className="inline-block">
                        <button
                          onClick={() => toggleUnfreezeForm(item.auction_id)}
                          className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                        >
                          Unfreeze Request
                        </button>
                      </div>
                    }


                    <button
                      onClick={() => handleStatusChange(item.auction_id, 'active')}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-red-500 hover:text-white hover:border-red-500"
                    >

                      Unfreeze
                    </button>
                  </div>
                )}

              </div>

              {/* Edit form */}
              {viewingAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <ViewAuction
                    auctionId={item.auction_id}
                    itemSeller={item.item_seller}
                    itemName={item.item_name}
                    startingPrice={item.item_starting_price} // Replace with actual data
                    startTime={formatDateTime(item.item_start_time)} // Replace with actual data
                    endTime={formatDateTime(item.item_end_time)} // Replace with actual data
                    itemDescription={item.item_information}
                    imageUrl={item.image_url}
                    onCancel={() => setViewingAuctionId(null)} // Close the form

                  />
                </div>
              )}
              {frozenAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <ViewRequestUnfreeze
                    onCancel={() => setFrozenAuctionId(null)}
                    descriptionInput={item.unfreeze_request_description}
                    timestampInput={formatDateTime(item.unfreeze_request_timestamp)}
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
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button onClick={generateForensicsCSV} className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black">
              Generate Forensics
            </button>
            <SignOutButton />
          </div>
        </div>
        <div className="space-y-6">
          <AuctionTable title="FROZEN" items={auctionData.frozen} itemStatus={status.frozen} />
          <AuctionTable title="ACTIVE" items={auctionData.active} itemStatus={status.active} />
          <AuctionTable title="UNLISTED" items={auctionData.unlisted} itemStatus={status.inactive} />
          <AuctionTable title="BOUGHT" items={auctionData.bought} itemStatus={status.completed} />
          <AuctionTable title="FAILED" items={auctionData.failed} itemStatus={status.failed} />
          <AuctionTable title="ARCHIVED" items={auctionData.archived} itemStatus={status.archived} />

        </div>
      </div>
    </Suspense>
  );
};

const AdminDashboardWrapper = () => {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

export default AdminDashboardWrapper;