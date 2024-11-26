import React, {useState, FormEvent, ChangeEvent} from 'react';

interface RequestUnfreezeProps {
    onCancel: () => void;
    onSubmit: (reason: string, timestamp: string) => void;
  }
  
  const RequestUnfreeze: React.FC<RequestUnfreezeProps> = ({ onCancel, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [timestamp] = useState(() => new Date().toISOString()); // Initialize timestamp once
  
    return (
      <div className="p-4 border rounded bg-white">
        <h3 className="font-bold text-lg text-black">Request Unfreeze</h3>
        <div className="mt-2">
          <label className="block mb-1 text-black">Reason:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded p-2 text-black"
          />
        </div>
        <div className="mt-2">
          <label className="block mb-1 text-black">Timestamp:</label>
          <input
            type="text"
            value={new Date(timestamp).toLocaleString()} // Display timestamp in a user-friendly format
            readOnly
            className="w-full border rounded p-2 bg-gray-100 text-black"
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onSubmit(reason, timestamp)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  export default RequestUnfreeze;