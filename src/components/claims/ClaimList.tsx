import React, { useMemo } from "react";

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

interface ClaimListProps {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

const ClaimList: React.FC<ClaimListProps> = ({
  claims,
  loading,
  error,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
}) => {
  // Filter and sort claims locally
  const filteredAndSortedClaims = useMemo(() => {
    let filtered = [...claims];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (claim) =>
          claim.claimNo.toLowerCase().includes(query) ||
          claim.userName.toLowerCase().includes(query) ||
          claim.claimType.toLowerCase().includes(query) ||
          claim.items.some(item => 
            item.fromPlace.toLowerCase().includes(query) ||
            item.toPlace.toLowerCase().includes(query) ||
            item.expenseType.toLowerCase().includes(query)
          )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.claimDate).getTime();
      const dateB = new Date(b.claimDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [claims, searchQuery, sortOrder]);

  // Calculate pagination - need to count total items, not just claims
  const totalItems = filteredAndSortedClaims.reduce((total, claim) => 
    total + Math.max(claim.items.length, 1), 0
  );
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedClaims = filteredAndSortedClaims.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const getStatusBadge = (claim: Claim) => {
    return (
      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        Approved
      </span>
    );
  };

  const displayStartIndex = totalItems > 0 ? startIndex + 1 : 0;
  const displayEndIndex = Math.min(endIndex, totalItems);

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full mx-auto">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-base font-semibold">
            Total Claims: <span className="font-bold text-blue-600">{totalItems}</span>
          </span>
          <span className="text-sm text-gray-600">
            Showing {displayStartIndex} - {displayEndIndex} of {totalItems}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Latest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Claim No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Claim Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Salesman</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Claim Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">From</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mode</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expense Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actual KM</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={13} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading claims...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={13} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 font-semibold">{error}</p>
                  </div>
                </td>
              </tr>
            ) : paginatedClaims.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">No claims found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedClaims.map((claim, idx) => 
                claim.items.length > 0 ? (
                  claim.items.map((item, itemIdx) => (
                    <tr key={`${claim.id}-${item.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{displayStartIndex + idx + itemIdx}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                          {claim.claimNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(claim.claimDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{claim.userName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {claim.claimType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.fromPlace}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.toPlace}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">{item.modeOfTravel}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.expenseType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {item.actualKm ? `${item.actualKm} km` : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                        ₹{item.amount != null ? item.amount.toLocaleString() : '0'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={item.comments}>
                        {item.comments || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(claim)}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{displayStartIndex + idx}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                        {claim.claimNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(claim.claimDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{claim.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {claim.claimType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">-</td>
                    <td className="px-4 py-3 text-sm text-gray-700">-</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{claim.modeOfTravel}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">-</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">-</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">₹0</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(claim)}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 border-2 rounded-md font-medium text-sm transition-all ${
                pagination.hasPrevPage
                  ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              ← Previous
            </button>

            {/* First Page */}
            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-all"
                >
                  1
                </button>
                {getPageNumbers()[0] > 2 && (
                  <span className="px-2 text-gray-500 font-bold">...</span>
                )}
              </>
            )}

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Last Page */}
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                  <span className="px-2 text-gray-500 font-bold">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-all"
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 border-2 rounded-md font-medium text-sm transition-all ${
                pagination.hasNextPage
                  ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimList;