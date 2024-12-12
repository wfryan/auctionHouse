import React, { useEffect, useState } from 'react';

interface ViewAuctionFormProps {
  auctionId: number;
  itemSeller: string;
  itemName: string;
  startingPrice: number;
  startTime: string;
  endTime: string;
  itemDescription?: string;
  imageUrl?: string

  onCancel: () => void;

}

const ViewAuction: React.FC<ViewAuctionFormProps> = ({
  auctionId,
  itemName,
  startingPrice,
  startTime,
  endTime,
  itemDescription = '',
  imageUrl,
  onCancel,
}) => {
  const [updatedItemName, setUpdatedItemName] = useState(itemName);
  const [updatedStartingPrice, setUpdatedStartingPrice] = useState(startingPrice);
  const [updatedStartTime, setUpdatedStartTime] = useState(startTime);
  const [updatedEndTime, setUpdatedEndTime] = useState(endTime);
  const [updatedExtraInfo, setUpdatedExtraInfo] = useState(itemDescription);
  const [previewImage, setPreviewImage] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    setUpdatedItemName(itemName)
    setUpdatedStartingPrice(startingPrice);
    setUpdatedStartTime(startTime);
    setUpdatedEndTime(endTime);
    setUpdatedExtraInfo(itemDescription);

  }, [])


  const formatPrice = (value: number) => {
    if (!value && value !== 0) return '$0';
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">View Auction #{auctionId}</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Item Name
          </label>
          <div className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100">
            {updatedItemName}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Starting Price
          </label>
          <div className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100">
            {formatPrice(updatedStartingPrice)}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Start Time
          </label>
          <div className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100">
            {updatedStartTime}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            End Time
          </label>
          <div className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100">
            {updatedEndTime}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Extra Information
          </label>
          <div className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100">
            {updatedExtraInfo}
          </div>
        </div>
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="w-32 h-32 object-contain mt-2"
          />
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );

};

export default ViewAuction;