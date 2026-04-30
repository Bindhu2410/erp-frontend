import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { FaCheck, FaTimes, FaUser, FaCalendarAlt, FaRupeeSign, FaMapMarkerAlt } from "react-icons/fa";
import api from "../../services/api";

interface ClaimDetails {
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
    date?: string;
    billUrl: string | null;
  }[];
}

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: number | null;
  onApprove: (claimId: number) => void;
  onReject: (claimId: number) => void;
}

const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  isOpen,
  onClose,
  claimId,
  onApprove,
  onReject,
}) => {
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimDetails = async () => {
    if (!claimId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ClaimDetails>(`Claims/${claimId}`);
      setClaimDetails(response.data);

    } catch (err: any) {
      setError(err.message || "Failed to fetch claim details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && claimId) {
      fetchClaimDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, claimId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const normalizeExpenseType = (type?: string) =>
    (type || "")
      .toLowerCase()
      .replace(/expenses?/g, "")
      .replace(/allowances?/g, "allowance")
      .replace(/stationary/g, "stationery")
      .replace(/\s+/g, " ")
      .trim();

  const EXPENSE_LABEL_MAP: Record<string, string> = {
    "printing and stationery": "Printing and Stationery",
    "printing stationery": "Printing and Stationery",
    "printing and stationary": "Printing and Stationery",
    "daily allowance": "Daily Allowance",
    "summer allowance": "Summer Allowance",
    "summer": "Summer Allowance",
    "booking": "Booking",
    "tollgate": "Tollgate",
    "travelling": "Travelling",
    "lodging": "Lodging",
  };

  const getDisplayExpenseLabel = (raw: string) => {
    const normalized = normalizeExpenseType(raw);
    return EXPENSE_LABEL_MAP[normalized] ?? (raw ? raw.replace(/\b\w/g, (c) => c.toUpperCase()) : "");
  };

  const shouldShowFromTo = (expenseType?: string) => {
    const normalized = normalizeExpenseType(expenseType);
    const travelLike = ["travelling", "car", "auto", "bus", "train", "tollgate", "conveyance", "local conveyance"];
    const sundriesLike = ["printing and stationery", "printing stationery", "printing and stationary", "booking", "booking expenses", "daily allowance", "daily allowances", "summer", "summer allowance", "tollgate", "lodging"];
    return travelLike.includes(normalized) || sundriesLike.includes(normalized);
  };

  const getTotalAmount = () => {
    return claimDetails?.items.reduce((total, item) => total + item.amount, 0) || 0;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Details" type="lg">
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {claimDetails && (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{claimDetails.claimNo}</h2>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 font-bold text-xl">
                  <FaRupeeSign className="mr-1" />
                  <span>{getTotalAmount().toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <FaUser className="mr-3 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-semibold">{claimDetails.userName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-3 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Claim Date</p>
                  <p className="font-semibold">{formatDate(claimDetails.claimDate)}</p>
                </div>
              </div>
            </div>

            {/* Claim Items grouped by category with subtotals */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Expense Details</h3>

              {(() => {
                if (!claimDetails) return null;

                const groups: Record<string, typeof claimDetails.items> = {
                  travel: [],
                  conveyance: [],
                  boarding: [],
                  sundries: [],
                };

                const getCategory = (expenseType?: string) => {
                  const normalized = normalizeExpenseType(expenseType || "");
                  if (["travelling", "car", "auto", "bus", "train", "travel"].includes(normalized)) return "travel";
                  if (["local conveyance", "conveyance"].includes(normalized)) return "conveyance";
                  if (["boarding", "lodging", "hotel"].includes(normalized)) return "boarding";
                  return "sundries";
                };

                (claimDetails.items || []).forEach((item) => {
                  const cat = getCategory(item.expenseType);
                  groups[cat].push(item);
                });

                const titles: Record<string, string> = {
                  travel: "Travel Expenses",
                  conveyance: "Local Conveyance",
                  boarding: "Boarding Charges",
                  sundries: "Sundries",
                };

                return (Object.keys(groups) as Array<keyof typeof groups>).map((cat) => {
                  const items = groups[cat];
                  if (!items || items.length === 0) return null;
                  const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0);

                  return (
                    <div key={cat} className="mb-4">
                      <h4 className="font-semibold mb-2">{titles[cat]}</h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                {shouldShowFromTo(item.expenseType) && (item.fromPlace || item.toPlace) && (
                                  <div className="flex items-center mb-2">
                                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      {item.fromPlace || "-"} → {item.toPlace || "-"}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm text-gray-600 space-y-1">
                                  {item.date && <p><span className="font-medium">Date:</span> {formatDate(item.date)}</p>}
                                  {item.modeOfTravel && <p><span className="font-medium">Mode:</span> {item.modeOfTravel}</p>}
                                  <p><span className="font-medium">Type:</span> {getDisplayExpenseLabel(item.expenseType)}</p>
                                </div>
                                {item.actualKm && (
                                  <p><span className="font-medium">Distance:</span> {item.actualKm} km</p>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-500">Amount</span>
                                  <div className="flex items-center text-green-600 font-semibold">
                                    <FaRupeeSign className="mr-1 text-sm" />
                                    <span>{item.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                                {item.comments && (
                                  <div className="text-sm">
                                    <p className="text-gray-500 mb-1">Comments:</p>
                                    <p className="text-gray-700 bg-gray-50 p-2 rounded">{item.comments}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-2">
                        <div className="text-sm font-semibold">Total {titles[cat]}: <span className="ml-2 text-green-600"><FaRupeeSign className="mr-1 inline" />{subtotal.toFixed(2)}</span></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => claimId && onReject(claimId)}
                className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimes className="mr-2" />
                Reject
              </button>
              <button
                onClick={() => claimId && onApprove(claimId)}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaCheck className="mr-2" />
                Approve
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ClaimDetailsModal;