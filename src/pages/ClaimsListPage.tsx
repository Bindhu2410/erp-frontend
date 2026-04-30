import React, { useState, useEffect } from "react";

interface ClaimData {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  claimNo?: string;
  claimDate: string;
  userName: string;
  claimType: string;
  fromPlace: string;
  toPlace: string;
  modeOfTravel: string;
  expenseType: string;
  amount: number;
  actualKm: number;
  comments: string;
}

const ClaimsListPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch('http://localhost:5104/api/Claims');
      if (response.ok) {
        const data = await response.json();
        setClaims(data);
      } else {
        console.error('Failed to fetch claims');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-lg">Loading claims...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 py-8">
      <h1 className="text-2xl font-bold text-center mb-2">Claims List</h1>
      <p className="text-center text-gray-600 mb-8">View all submitted claims</p>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Claims</h2>
          <button 
            onClick={fetchClaims}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border text-left">Claim No</th>
                <th className="px-3 py-2 border text-left">Date</th>
                <th className="px-3 py-2 border text-left">User</th>
                <th className="px-3 py-2 border text-left">Type</th>
                <th className="px-3 py-2 border text-left">From</th>
                <th className="px-3 py-2 border text-left">To</th>
                <th className="px-3 py-2 border text-left">Travel Mode</th>
                <th className="px-3 py-2 border text-left">Expense Type</th>
                <th className="px-3 py-2 border text-left">KM</th>
                <th className="px-3 py-2 border text-left">Amount</th>
                <th className="px-3 py-2 border text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-500">
                    No claims found
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">{claim.claimNo}</td>
                    <td className="px-3 py-2 border">
                      {new Date(claim.claimDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 border">{claim.userName}</td>
                    <td className="px-3 py-2 border">{claim.claimType}</td>
                    <td className="px-3 py-2 border">{claim.fromPlace}</td>
                    <td className="px-3 py-2 border">{claim.toPlace}</td>
                    <td className="px-3 py-2 border">{claim.modeOfTravel}</td>
                    <td className="px-3 py-2 border">{claim.expenseType}</td>
                    <td className="px-3 py-2 border">{claim.actualKm}</td>
                    <td className="px-3 py-2 border">₹{claim.amount}</td>
                    <td className="px-3 py-2 border">{claim.comments}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClaimsListPage;