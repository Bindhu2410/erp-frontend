import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdEdit, MdAdd, MdDelete, MdUpdate, MdEmail } from "react-icons/md";

const getActionIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("create")) {
    return <MdAdd className="text-green-500 text-xl" />;
  } else if (lowerTitle.includes("edit") || lowerTitle.includes("modify")) {
    return <MdEdit className="text-blue-500 text-xl" />;
  } else if (lowerTitle.includes("delete")) {
    return <MdDelete className="text-red-500 text-xl" />;
  } else if (lowerTitle.includes("email")) {
    return <MdEmail className="text-purple-500 text-xl" />;
  } else {
    return <MdUpdate className="text-gray-500 text-xl" />;
  }
};

const getActionColor = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("create")) {
    return "bg-green-100 border-green-200";
  } else if (lowerTitle.includes("edit") || lowerTitle.includes("modify")) {
    return "bg-blue-100 border-blue-200";
  } else if (lowerTitle.includes("delete")) {
    return "bg-red-100 border-red-200";
  } else if (lowerTitle.includes("email")) {
    return "bg-purple-100 border-purple-200";
  } else {
    return "bg-gray-100 border-gray-200";
  }
};

const SummaryTimeline: React.FC<{ stageItemId: string }> = ({
  stageItemId,
}) => {
  const [allSummary, setAllSummary] = useState<any[]>([]);
  const [displayedSummary, setDisplayedSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const recordsPerPage = 10;

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/SalesSummary/stage/${stageItemId}`
      );
      const data = response.data || [];
      setAllSummary(data);
      setDisplayedSummary(data.slice(0, recordsPerPage));
      setHasMore(data.length > recordsPerPage);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = () => {
    const currentLength = displayedSummary.length;
    const nextBatch = allSummary.slice(
      currentLength,
      currentLength + recordsPerPage
    );
    setDisplayedSummary([...displayedSummary, ...nextBatch]);
    setHasMore(currentLength + recordsPerPage < allSummary.length);
  };

  useEffect(() => {
    fetchSummary();
  }, [stageItemId]);

  return (
    <div className="bg-white w-full p-6 rounded-lg shadow-sm">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Summary Timeline
      </h3>
      <div className="relative">
        {displayedSummary.map((item, index) => (
          <div key={index} className="flex items-start mb-8 relative group">
            {index !== displayedSummary.length - 1 && (
              <div className="absolute top-8 left-5 h-full border-l-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors"></div>
            )}
            <div
              className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-transform duration-200 transform group-hover:scale-110 ${getActionColor(
                item.title
              )}`}
            >
              {getActionIcon(item.title)}
            </div>
            <div className="ml-4 flex-1">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {item.title}
                  {item.status && (
                    <span className="text-sm px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      {item.status}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MdUpdate className="text-orange-500" />
                    {item.dateTime ? new Date(item.dateTime).toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMoreData}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <MdAdd className="text-xl" />
                Show More ({allSummary.length - displayedSummary.length}{" "}
                remaining)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SummaryTimeline;
