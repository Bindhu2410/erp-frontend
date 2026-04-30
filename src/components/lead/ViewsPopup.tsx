import React from "react";
import { FaRegClock as Clock } from "react-icons/fa";
import { Comment } from "../models/ViewModel";
import { formatDate } from "./FormateDate";
import { getAvatarUrl } from "../common/Avatar";

interface ViewsPopupProps {
  comment: Comment;
}

export function ViewsPopup({ comment }: ViewsPopupProps) {
  const userDetails = localStorage.getItem("userDetails");
  const currentUser = userDetails && JSON.parse(userDetails);
  const filteredViews = comment.views?.filter(
    (view) =>
      view.userEmail.toLowerCase() !== currentUser?.userName.toLowerCase()
  );
  if (!filteredViews?.length) return null;
  console.log(comment, "ssss:");

  return (
    <div className="absolute right-3 top-8 bg-white rounded-lg shadow-lg border p-3 min-w-[200px] z-10">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Viewed by
      </h4>
      <div className="space-y-2">
        {filteredViews.map((view: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <img
              src={getAvatarUrl(view.userEmail)}
              alt={view.userEmail}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {view.userEmail.split("@")[0]}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(view.viewedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
