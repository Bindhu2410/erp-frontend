import React from "react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Comment } from "../models/ViewModel";

interface CommentActionsProps {
  comment: Comment;
  userId: string;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  handleDelete: (id: string) => void;
  canEditComment: (comment: Comment) => boolean;
}

export function CommentActions({
  comment,
  userId,
  activeMenu,
  setActiveMenu,
  setEditingId,
  setEditContent,
  handleDelete,
  canEditComment,
}: CommentActionsProps) {
  // if (userId?.toLowerCase() !== comment?.user?.email?.toLowerCase())
  //   return null;

  return (
    <div className="relative">
      <button
        onClick={() =>
          setActiveMenu(activeMenu === comment?.id ? null : comment.id)
        }
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        {activeMenu === comment.id ? (
          <FiX className="w-5 h-5 text-gray-500" />
        ) : (
          <FiMoreVertical className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {activeMenu === comment.id && (
        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10">
          {/* {canEditComment(comment) && ( */}
          <button
            onClick={() => {
              setEditingId(comment.id);
              setEditContent(comment.content);
              setActiveMenu(null);
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          {/* )} */}
          <button
            onClick={() => handleDelete(comment.id)}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 text-red-500"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
