'use client';
import React, { useState, ChangeEvent, Suspense } from 'react';

import { useRouter } from 'next/navigation';
import { instance } from '../utils/auctionHouseApi';
import { getUsername } from '../utils/jwt';


const CreateAuctionForm = () => {

  //State Declaration for Form Data
  const [formData, setFormData] = useState({
    itemName: '',
    itemDescription: '',
    startingPrice: '',
    startTime: '',
    endTime: '',
    auctionType: '',
    image: null as File | null
  });

  const router = useRouter()

  const [imagePreview, setImagePreview] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  const [dateErrorStart, setDateErrorStart] = useState<string>('');
  const [dateErrorEnd, setDateErrorEnd] = useState<string>('');

  //Input Handler for Price
  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) => {
    console.log(formData.startTime)
    setDateErrorStart('');
    setDateErrorEnd('');
    const { name, value } = e.target;
    if (name === 'startingPrice') {
      const rawValue = value.replace(/[$\s]/g, '');
      if (rawValue.includes('.')) {
        setPriceError('Use only whole numbers');
        setFormData(prev => ({
          ...prev,
          [name]: rawValue
        }));
        return;
      }
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        setPriceError('');
        setFormData(prev => ({
          ...prev,
          [name]: rawValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  //Format Price 
  const formatPrice = (value: string) => {
    if (!value) return '$ ';
    return `$ ${value}`;
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

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

  const handleBack = () => {
    router.push('/auction_dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priceError) {
      alert('Please fix the errors before submitting');
      return;
    }

    if (new Date(formData.startTime) < new Date()) {
      setDateErrorStart("Date is too early");
      return;
    }

    if (new Date(formData.endTime) < new Date()) {
      setDateErrorEnd("Date is too early");
      return;
    }

    if (new Date(formData.startTime) > new Date(formData.endTime)) {
      setDateErrorEnd("Date is before start time");
      return;
    }




    const functionInput = JSON.stringify({
      username: getUsername(),
      itemName: formData.itemName,
      startingPrice: formData.startingPrice,
      itemDescription: formData.itemDescription,
      startTime: formData.startTime,
      endTime: formData.endTime,
      image: formData.image?.name,
      auctionType: formData.auctionType === "buyNow" ? true : false,
    });

    try {
      //make auction and auction_item without item url
      const createAuctionResponse = await instance.post('/auction/createAuction', functionInput);

      if (createAuctionResponse && createAuctionResponse.data.imageAdded) {
        let base64data = null;
        console.log(formData.image);
        if (formData.image != null) {
          base64data = await fileToBase64(formData.image);
        }
        console.log(base64data);

        const imageName = `${createAuctionResponse.data.auctionId}${formData.image?.name}`
        const imageResponseBody = JSON.stringify({ fileContent: base64data, fileName: imageName, fileType: formData.image?.type });
        const imageResponse = await instance.post('/items/uploadImage', imageResponseBody);

        const uploadURLbody = JSON.stringify({ auctionItemId: createAuctionResponse.data.auctionId, imageURL: imageResponse.data.body.fileUrl })
        await instance.post('/items/updateImageURL', uploadURLbody);
      }
      const status = createAuctionResponse.data.statusCode;
      console.log(createAuctionResponse);

      if (status === 200) {
        //alert(response.data);
        console.log(createAuctionResponse.data);
        // Redirect only after a successful response
        router.push('/auction_dashboard')
        //window.location.href = '/pages/auction_dashboard' + appendedUrl;
      } else {
        // Handle any other status codes appropriately
        alert('Error: ' + createAuctionResponse.data.body); // Adjust based on your response structure
      }
    } catch (error) {
      console.log(error);
      alert('There was an error submitting the form. Please try again.');
    }
    //window.location.href = '/seller';
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
        <div className="mb-6 relative">
          {/* Back to Dashboard Button */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full sm:w-auto px-3 py-3 sm:py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black font-medium transition-colors duration-200"
            onClick={handleBack}
          >
            Back to Dashboard
          </button>
          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Create New Auction
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Item Name Field */}
            <div className="md:col-span-2">
              <label htmlFor="itemName" className="block text-sm font-medium text-white-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                maxLength={50}
                required
                className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                value={formData.itemName}
                onChange={handleInputChange}
              />
            </div>

            {/* Starting Price Field*/}
            <div className="flex flex-col">
              <label htmlFor="startingPrice" className="block text-sm font-medium text-white-700 mb-2">
                Starting Price (Whole Numbers Only)
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  id="startingPrice"
                  name="startingPrice"

                  className={`w-full p-2 sm:p-3 border-2 ${priceError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black`}
                  value={formatPrice(formData.startingPrice)}
                  onChange={handleInputChange}
                  inputMode="numeric"
                />
                {/* Error message now part of flex column layout with padding */}
                {priceError && (
                  <div className="text-red-500 text-sm pt-2">
                    {priceError}
                  </div>
                )}
              </div>
            </div>

            {/* Time Fields Container */}
            <div className="space-y-4">
              {/* Start Time Field */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-white-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              {dateErrorStart && (
                <div className="text-red-500 text-sm mt-1">
                  {dateErrorStart}
                </div>
              )}

              {/* End Time Field */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-white-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
              {dateErrorEnd && (
                <div className="text-red-500 text-sm mt-1">
                  {dateErrorEnd}
                </div>
              )}
            </div>

            {/* Extra Info */}
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-white-700 mb-2">
                Extra Information
              </label>
              <textarea
                id="itemDescription"
                name="itemDescription"
                className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black resize-none"
                value={formData.itemDescription}
                onChange={handleInputChange}
                rows={4}
              />
              <label htmlFor="dropdown" className="block text-sm font-medium text-white-700 mt-4 mb-2">
                Item Type
              </label>
              <select
                id="dropdown"
                name="auctionType"
                className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                value={formData.auctionType}
                onChange={(e) => handleInputChange(e)}
              >

                <option value="auction">Auction</option>
                <option value="buyNow">Buy Now</option>
              </select>
            </div>

            {/* Image Upload Field */}
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-white-700 mb-2">
                Item Picture (Max 2MB)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48 sm:h-64 border-2 border-gray-300 rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black font-medium transition-colors duration-200"
            >
              Create Auction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateAuctionWrapper = () => {
  return (
    <Suspense fallback={<div>Loading Form...</div>}>
      <CreateAuctionForm />
    </Suspense>
  );
}

export default CreateAuctionWrapper;