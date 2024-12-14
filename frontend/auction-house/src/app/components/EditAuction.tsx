import React, { useState, ChangeEvent, FormEvent } from 'react';

interface EditAuctionFormProps {
  auctionId: number;
  itemName: string;
  startingPrice: number;
  startTime: string;
  endTime: string;
  itemDescription?: string;
  auctionType: string;
  image?: File | string | null; // Optional field for image
  imageUrl?: string
  onCancel: () => void;

  onSubmit: (updatedAuction: {
    auctionId: number;
    itemName: string;
    startingPrice: number;
    startTime: string;
    endTime: string;
    itemDescription: string;
    auctionType: string;
    image?: File | null; // Optional field for image
  }) => void;
}

const EditAuction: React.FC<EditAuctionFormProps> = ({
  auctionId,
  itemName,
  startingPrice,
  startTime,
  endTime,
  itemDescription = '',
  auctionType,
  image,
  imageUrl,
  onCancel,
  onSubmit,
}) => {
  const [updatedItemName, setUpdatedItemName] = useState(itemName);
  const [updatedStartingPrice, setUpdatedStartingPrice] = useState(startingPrice);
  const [updatedStartTime, setUpdatedStartTime] = useState(startTime);
  const [dateErrorStart, setDateErrorStart] = useState<string>('');
  const [updatedEndTime, setUpdatedEndTime] = useState(endTime);
  const [dateErrorEnd, setDateErrorEnd] = useState<string>('');
  const [updatedExtraInfo, setUpdatedExtraInfo] = useState(itemDescription);
  const [updatedAuctionType, setUpdatedAuctionType] = useState(auctionType);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(imageUrl || null);
  const [priceError, setPriceError] = useState<string>('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(image)
    if (file) {
      // Set the selected file
      setSelectedImage(file);

      // Create a preview of the new file
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (priceError) return;

    if (new Date(updatedStartTime) < new Date()) {
      setDateErrorStart("Date is too early");
      return;
    }

    if (new Date(updatedEndTime) < new Date()) {
      setDateErrorEnd("Date is too early");
      return;
    }

    if (new Date(updatedStartTime) > new Date(updatedEndTime)) {
      setDateErrorEnd("Date is before start time");
      return;
    }



    onSubmit({
      auctionId,
      itemName: updatedItemName,
      startingPrice: updatedStartingPrice,
      startTime: updatedStartTime,
      endTime: updatedEndTime,
      itemDescription: updatedExtraInfo,
      auctionType: updatedAuctionType,
      image: selectedImage, // Include the image file in the submission
    });
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const rawValue = value.replace(/[$,\s]/g, '');

    if (rawValue === '') {
      setUpdatedStartingPrice(0);
      setPriceError('');
      return;
    }

    if (rawValue.includes('.')) {
      setPriceError('Please enter a whole number without decimals');
      return;
    }

    if (/^\d+$/.test(rawValue)) {
      const numericValue = parseInt(rawValue, 10);
      setUpdatedStartingPrice(numericValue);
      setPriceError('');
    } else {
      setPriceError('Please enter a valid whole number');
    }
  };

  const formatPrice = (value: number) => {
    if (!value && value !== 0) return '$0';
    return `$${value.toLocaleString()}`;
  };



  return (
    <div className="p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Edit Auction #{auctionId}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Item Name
          </label>
          <input
            type="text"
            value={updatedItemName}
            onChange={(e) => setUpdatedItemName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Starting Price
          </label>
          <div className="flex flex-col">
            <input
              type="text"
              value={formatPrice(updatedStartingPrice)}
              onChange={handlePriceChange}
              className={`mt-1 block w-full p-2 border ${priceError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-black`}
              inputMode="numeric"
            />
            {priceError && (
              <div className="text-red-500 text-sm mt-1">
                {priceError}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={updatedStartTime}
            onChange={(e) => { setUpdatedStartTime(e.target.value); setDateErrorStart(''); }}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
          {dateErrorStart && (
            <div className="text-red-500 text-sm mt-1">
              {dateErrorStart}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            End Time
          </label>
          <input
            type="datetime-local"
            value={updatedEndTime}
            onChange={(e) => { setUpdatedEndTime(e.target.value); setDateErrorEnd(''); }}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
          {dateErrorEnd && (
            <div className="text-red-500 text-sm mt-1">
              {dateErrorEnd}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Extra Information
          </label>
          <textarea
            value={updatedExtraInfo}
            onChange={(e) => setUpdatedExtraInfo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
          <label htmlFor="dropdown" className="block text-sm font-medium text-black">
            Item Type
          </label>
          <select
            id="dropdown"
            name="auctionType"
            className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
            value={updatedAuctionType}
            onChange={(e) => setUpdatedAuctionType(e.target.value)}
          >
            <option value="" disabled>
              Choose an Auction Type
            </option>
            <option value="auction">Auction</option>
            <option value="buyNow">Buy Now</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Item Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-32 h-32 object-contain mt-2"
            />
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${priceError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
            disabled={!!priceError}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuction;