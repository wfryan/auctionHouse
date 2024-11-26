import React, { useState, FormEvent } from 'react';

interface RequestUnfreezeProps {
  onCancel: () => void;
  onSubmit: (reason: string, timestamp: string) => void;
}

/**
 * 
 * @param param0 Request unfreeze 
 * @returns 
 */

const RequestUnfreeze: React.FC<RequestUnfreezeProps> = ({ onCancel, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [timestamp] = useState(() => new Date().toISOString()); // Initialize timestamp once
  const [reasonError, setReasonError] = useState<string>('');

  // Function to handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setReasonError('Reason is required');
      return;
    }

    // Reset error and submit form data
    setReasonError('');
    onSubmit(reason, timestamp);
  };

  // Function to format the timestamp to EST
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const utcDate = new Date(dateTime);
    if (isNaN(utcDate.getTime()) || utcDate.getFullYear() <= 1970) return '';

    const estDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const year = estDate.getFullYear();
    const month = String(estDate.getMonth() + 1).padStart(2, '0');
    const day = String(estDate.getDate()).padStart(2, '0');
    const hours = String(estDate.getHours()).padStart(2, '0');
    const minutes = String(estDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Request Unfreeze</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`mt-1 block w-full p-2 border ${reasonError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-black`}
            required
          />
          {reasonError && (
            <div className="text-red-500 text-sm mt-1">
              {reasonError}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">
            Timestamp
          </label>
          <input
            type="datetime-local"
            value={formatDateTime(timestamp)} // Display timestamp in EST
            readOnly
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100"
          />
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
            className={`px-4 py-2 ${reasonError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
            disabled={!!reasonError}
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestUnfreeze;
