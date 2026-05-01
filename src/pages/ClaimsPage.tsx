import React, { useState, useEffect } from "react";
import ClaimForm, { ClaimFormData } from "../components/claims/ClaimForm";
import ClaimList from "../components/claims/ClaimList";
import { ClaimListHeader, ClaimListCards } from "../components/claims/ClaimListHeader";
import Modal from "../components/common/Modal";

interface Claim {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
  claimNo: string;
  claimDate: string;
  userName: string;
  claimType: string;
  modeOfTravel: string;
  items: {
    id: number;
    claimId: number;
    fromPlace: string;
    toPlace: string;
    modeOfTravel: string;
    expenseType: string;
    amount: number;
    actualKm: number | null;
    comments: string;
    billUrl: string | null;
  }[];
}

const ClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch claims from API
  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}Claims`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }

      const data = await response.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch claims");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAddClaim = async (data: ClaimFormData) => {
    // This function is no longer needed since ClaimForm handles API call directly
    // Just close the modal - the refetch will happen in onSuccess
  };

  const handleCreateClick = () => setShowForm(true);
  const handleCloseModal = () => setShowForm(false);

  return (
    <div className="min-h-[60vh] bg-gray-50 py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Claim List</h1>
        <div className="flex items-center gap-2">
          <button 
            className="border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Export as
          </button>
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 text-sm font-semibold transition-colors" 
            onClick={handleCreateClick}
          >
            Create Claim
          </button>
        </div>
      </div>
      
      <ClaimListCards />
      
      <div className="mt-8">
        <Modal isOpen={showForm} onClose={handleCloseModal} title="Create Claim">
          <ClaimForm 
            onSubmit={handleAddClaim} 
            onSuccess={() => {
              fetchClaims();
              setShowForm(false);
            }}
            onClose={handleCloseModal}
          />
        </Modal>
        
        <ClaimList 
          claims={claims}
          loading={loading}
          error={error}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>
    </div>
  );
};

export default ClaimsPage;