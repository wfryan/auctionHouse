'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { instance } from '../utils/auctionHouseApi';
import { getToken } from '../utils/cookie';
import { decodeToken, getUsername } from '../utils/jwt';
import SignOutButton from '../components/SignoutButton';
import EditAuction from '../components/EditAuction';
import RequestUnfreeze from '../components/RequestUnfreeze';
import ViewAuction from '../components/ViewAuction';

class Auction {
  auction_id: number
  item_name: string
  item_starting_price: number
  item_start_time: string
  item_end_time: string
  item_information: string
  auction_type: string
  image_file?: File | null
  image_url?: string


  constructor(aid: number, name: string, starting_bid: number, start_time: string, end_time: string, info: string, auctionType: string, image_file?: File, image_url?: string) {
    this.auction_id = aid;
    this.item_name = name;
    this.item_starting_price = starting_bid;
    this.item_start_time = start_time;
    this.item_end_time = end_time;
    this.item_information = info;
    this.auction_type = auctionType;
    this.image_file = image_file;
    this.image_url = image_url;
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

  //State to track the auctions current statuses

  const [editingAuctionId, setEditingAuctionId] = useState<number | null>(null);
  const [viewingAuctionId, setViewingAuctionId] = useState<number | null>(null);
  const [frozenAuctionId, setFrozenAuctionId] = useState<number | null>(null);

  const toggleEditForm = (auctionId: number) => {
    setEditingAuctionId((current) => (current === auctionId ? null : auctionId));
  };

  const toggleViewForm = (auctionId: number) => {
    setViewingAuctionId((current) => (current === auctionId ? null : auctionId));
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

  const formatTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    return formattedDateTime
  }

  const publishAuction = async (auction_id: number) => {
    setEditingAuctionId(null);
    const currentAuction = auctionData.unlisted.filter(auction => auction.auction_id == auction_id)[0]
    if (currentAuction.item_starting_price == 0 || currentAuction.item_end_time == null || currentAuction.image_url == null) {
      alert("Not enough information to publish")
      return;
    }
    const now = formatTime()
    const payload = JSON.stringify({
      auctionId: auction_id,
      now: now,
      token: `Bearer ${getToken()}`
    });
    try {
      const response = await instance.post('/auction/publish', payload);
      const status = response.data.statusCode;
      if (status === 200) {
        getAuctionInfo();
      }
      console.log(response)
      if (status === 418) {
        router.push('/login')
      }
    }
    catch (error) {
      console.log(error)
      alert("Error publishing auction")
    }

  };

  const handleFulfill = async (auction_id: number) => {
    const payload = JSON.stringify({
      auctionId: auction_id,
      token: `Bearer ${getToken()}`
    });

    console.log(auction_id)
    try {
      const response = await instance.post('/auction/fulfill', payload);
      const status = response.data.statusCode;
      if (status === 200) {
        getAuctionInfo();
      }
      console.log(response)
      if (status === 418) {
        router.push('/login')
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
        router.push('/login')
      }
    }
    catch (error) {
      console.log(error)
      alert("Error unpublishing auction")
    }

  };

  const getAuctionInfo = async () => {
    const tkn = getToken();
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
          processedData[key] = auctionData[key].map((item: { auction_id: number, item_picture: string, item_name: string, item_starting_price: number, item_start_time: string, item_end_time: string, item_information: string, auctionType: boolean }) => ({
            auction_id: item.auction_id,
            image_file: null,
            image_url: item.item_picture,
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
    const utcDate = new Date(dateTime);
    if (isNaN(utcDate.getTime()) || utcDate.getFullYear() <= 1970) return '';

    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    const hours = String(utcDate.getUTCHours()).padStart(2, '0');
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  //Converting File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          const base64Data = (reader.result as string).split(',')[1]; // Resolve with base64 data without the prefix
          resolve(base64Data);
        } else {
          reject(new Error('File reading result is empty'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };

      reader.readAsDataURL(file); // Start reading the file
    });
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
        ...(editedAuction.image_file ? { "imageURL": editedAuction.image_file?.name } : {})
      });

      console.log(payload);


      const response = await instance.post('auction/editAuctions', payload);
      const status = response.data.statusCode;
      const body = JSON.parse(response.data.body)


      if (status === 200 && !response.data.imageAdded) {
        console.log("Auction Updated Successfully!");
        getAuctionInfo();
        alert("Auction Updated Succesfully!")
        setEditingAuctionId(null)
      } else if (status === 200 && response.data.imageAdded) {
        let base64data = null;

        if (editedAuction.image_file != null) {
          base64data = await fileToBase64(editedAuction.image_file);
        }

        const imageName = `${body.auction_item_id}${editedAuction.image_file?.name}`
        const imageResponseBody = JSON.stringify({ fileContent: base64data, fileName: imageName /* send proper url to func */, fileType: editedAuction.image_file?.type }); //change off hardcoding
        const imageResponse = await instance.post('/items/uploadImage', imageResponseBody);

        const uploadURLbody = JSON.stringify({ auctionItemId: body.auction_item_id, imageURL: imageResponse.data.body.fileUrl })
        await instance.post('/items/updateImageURL', uploadURLbody);

        console.log("Auction Updated Successfully!");
        getAuctionInfo();
        alert("Auction Updated Succesfully!")
        setEditingAuctionId(null)
      }

      else {
        console.log("Failed to update auction.");
        alert("Auction could not be updated.");
      }
    } catch (error) {
      console.log("Error Submitting the form: ", error);
      alert('There was an error updating the auction. Please try again.');
    }
  };

  //Handler for Request Unfreeze Submission
  const handleRequestUnfreeze = async (auctionId: number, reason: string, timestamp: string) => {
    setFrozenAuctionId(null);
    try {
      const payload = JSON.stringify({
        "auctionId": auctionId,
        "reason": reason,
        "date": timestamp,
        "token": `Bearer ${getToken()}`
      });

      const response = await instance.post('auction/requestUnfreeze', payload);
      const status = response.data.statusCode;

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

  const removeItem = async (auction_id: number) => {
    console.log(getToken())
    const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/auction/removeItem", {
      method: "POST",
      body: JSON.stringify({
        username: user,
        auction_id: auction_id,
        token: `Bearer ${getToken()}`
      })
    })
    const respJson = await resp.json()
    console.log(respJson)
    await getAuctionInfo() //need to call again due to another auction perhaps changing in meantime
    if (respJson.statusCode == 200) {
      alert("Update successful")
    }
    else {
      alert(respJson.message)
    }
  }

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
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleEditForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Edit
                    </button>
                    <button onClick={() => removeItem(item.auction_id)} className="px-3 py-1 text-sm border border-black rounded hover:bg-red-500 hover:text-white hover:border-red-500">
                      Remove
                    </button>
                  </div>
                )}
                {itemStatus === status.Active && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
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
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleFrozenForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Request Unfreeze
                    </button>
                  </div>
                )}
                {itemStatus === status.Completed && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleFulfill(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      Fulfill Item
                    </button>
                  </div>
                )}
                {itemStatus == status.Archived && (
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleViewForm(item.auction_id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-blue-300 hover:text-white hover:border-blue-300"
                    >
                      View
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
                    image={item.image_file}
                    imageUrl={item.image_url}
                    onCancel={() => setEditingAuctionId(null)} // Close the form
                    onSubmit={(updatedAuction) => {
                      const convertedAuction = new Auction(
                        updatedAuction.auctionId,
                        updatedAuction.itemName,
                        updatedAuction.startingPrice,
                        updatedAuction.startTime,
                        updatedAuction.endTime,
                        updatedAuction.itemDescription,
                        updatedAuction.auctionType,
                        updatedAuction.image || undefined
                      );
                      console.log(item.image_file, item.image_url);
                      handleEditSubmit(convertedAuction);
                    }}
                  />
                </div>
              )}
              {viewingAuctionId === item.auction_id && (
                <div className="p-4 bg-black-50">
                  <ViewAuction
                    auctionId={item.auction_id}
                    itemSeller={""}
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