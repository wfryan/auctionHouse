import React, { useEffect, useState } from 'react';

interface RequestUnfreezeProps {
  onCancel: () => void;
  descriptionInput: string;
  timestampInput: string
}

/**
 * 
 * @param param0 Request unfreeze 
 * @returns 
 */

const ViewRequestUnfreeze: React.FC<RequestUnfreezeProps> = ({ onCancel, descriptionInput, timestampInput }) => {
  const [description, setDescription] = useState(descriptionInput);
  const [timestamp] = useState(timestampInput); // Initialize timestamp once
  const [reasonError, setReasonError] = useState<string>('');

  useEffect(() => {
    setDescription(descriptionInput)
    setReasonError('')
  }, [])

  // Function to handle form submission


  return (
    <div className="p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Request Unfreeze</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Reason
        </label>
        <textarea
          value={description}
          onChange={() => { }}
          readOnly
          className={`mt-1 block w-full p-2 border ${reasonError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-black`}
          required
        />

      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Timestamp
        </label>
        <input
          type="datetime-local"
          value={timestamp} // Display timestamp in EST
          onChange={() => { }}
          readOnly
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100"
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          onClick={onCancel}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewRequestUnfreeze;
