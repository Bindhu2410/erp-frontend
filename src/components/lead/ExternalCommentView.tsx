import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";

interface ExternalCommentProps {
  stage: string;
  stageItemId: string;
}

const ExternalCommentView: React.FC<ExternalCommentProps> = ({
  stage,
  stageItemId,
}) => {
  const [comments, setComments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/SalesExternalComment/stage/${stage}/${stageItemId}`
        );
        setComments(response.data);
      } catch (err) {
        setError("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [stage, stageItemId]);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM dd, yyyy HH:mm");
    } catch {
      return date;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-4">
            {comment.iconUrl && (
              <img
                src={comment.iconUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/40";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {comment.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.dateTime)}
                </span>
              </div>
              <p className="mt-1 text-gray-600 whitespace-pre-wrap">
                {comment.description}
              </p>
              {comment.stage && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {comment.stage}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {comments.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No comments available</p>
        </div>
      )}
    </div>
  );
};

export default ExternalCommentView;
