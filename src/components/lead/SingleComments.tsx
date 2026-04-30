import React from "react";
import { FiMessageSquare, FiEye } from "react-icons/fi";
import { Comment } from "../models/ViewModel";
import { CommentActions } from "./CommentActions";
import { ViewsPopup } from "./ViewsPopup";
import { formatDate } from "./FormateDate";
import { getAvatarUrl } from "../common/Avatar";

interface SingleCommentProps {
  comment: Comment;
  depth?: number;
  user: { id: string; email: string };
  editingId: string | null;
  editContent: string;
  replyingTo: string | null;
  replyContents: Record<string, string>;
  activeMenu: string | null;
  showViewsFor: string | null;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  setReplyingTo: (id: string | null) => void;
  setReplyContents: (
    fn: (prev: Record<string, string>) => Record<string, string>
  ) => void;
  setActiveMenu: (id: string | null) => void;
  setShowViewsFor: (id: string | null) => void;
  handleEdit: (id: string, stage: string, stageItemId: string) => void;
  handleDelete: (id: string) => void;
  handleReply: (id: string) => void;
  handleSeenClick: (id: string, event: React.MouseEvent) => void;
  canEditComment: (comment: Comment) => boolean;
}

export function SingleComment({
  comment,
  depth = 0,
  user,
  editingId,
  editContent,
  replyingTo,
  replyContents,
  activeMenu,
  showViewsFor,
  setEditingId,
  setEditContent,
  setReplyingTo,
  setReplyContents,
  setActiveMenu,
  setShowViewsFor,
  handleEdit,
  handleDelete,
  handleReply,
  handleSeenClick,
  canEditComment,
}: SingleCommentProps) {
  const isCurrentUserComment =
    comment.user?.email?.toLowerCase() === user?.email?.toLowerCase();
  const userDetails = localStorage.getItem("userDetails");
  const currentUser = userDetails && JSON.parse(userDetails);
  const filteredViews = comment.views?.filter(
    (view) =>
      view.userEmail.toLowerCase() !== currentUser?.userName.toLowerCase()
  );

  console.log(comment, "comment:::");
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow 
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <img
            src={getAvatarUrl(comment.user.email)}
            alt={comment.user.email}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <span className="font-semibold">{comment.user.email}</span>
            <span className="text-gray-500 text-sm ml-2">
              {formatDate(comment.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentUserComment && (
            <div className="relative">
              <button
                onClick={(e) => handleSeenClick(comment.id, e)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiEye className="w-5 h-5 text-gray-500" />
                {filteredViews.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {filteredViews.length}
                  </span>
                )}
              </button>
              {showViewsFor === comment.id && <ViewsPopup comment={comment} />}
            </div>
          )}

          <CommentActions
            comment={comment}
            userId={user.email || ""}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            setEditingId={setEditingId}
            setEditContent={setEditContent}
            handleDelete={handleDelete}
            canEditComment={canEditComment}
          />
        </div>
      </div>

      {editingId === comment.id ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleEdit(comment.id, "lead", "123")}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setEditContent("");
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex">
          <p className="text-gray-700 break-words flex-1">
            {comment.content}
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setEditingId(null);
                setEditContent("");
              }}
              className="text-blue-500 hover:text-blue-600 pl-4"
            >
              <span className="flex gap-1 items-center mt-2">
                <FiMessageSquare className="w-4 h-4" />
                <span className="items-center"> Reply</span>
              </span>
            </button>
          </p>
        </div>
      )}

      <div className="mt-2"></div>

      {replyingTo === comment.id && (
        <div className="mt-4 ml-8">
          <textarea
            value={replyContents[comment.id] || ""}
            onChange={(e) =>
              setReplyContents((prev) => ({
                ...prev,
                [comment.id]: e.target.value,
              }))
            }
            placeholder="Write a reply..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleReply(comment.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reply
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyContents((prev) => ({ ...prev, [comment.id]: "" }));
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies.map((reply: any) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          user={user}
          editingId={editingId}
          editContent={editContent}
          replyingTo={replyingTo}
          replyContents={replyContents}
          activeMenu={activeMenu}
          showViewsFor={showViewsFor}
          setEditingId={setEditingId}
          setEditContent={setEditContent}
          setReplyingTo={setReplyingTo}
          setReplyContents={setReplyContents}
          setActiveMenu={setActiveMenu}
          setShowViewsFor={setShowViewsFor}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleReply={handleReply}
          handleSeenClick={handleSeenClick}
          canEditComment={canEditComment}
        />
      ))}
    </div>
  );
}
