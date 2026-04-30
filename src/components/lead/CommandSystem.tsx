import React, { useState, useEffect, useRef } from "react";
import { Comment } from "../models/ViewModel";
import { SingleComment } from "./SingleComments";
import axios from "axios";

type commentSystemProps = {
  stage: string;
  stageItemId: string;
};

export default function CommentSystem({
  stage,
  stageItemId,
}: commentSystemProps) {
  console.log("command.data", stageItemId);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {}
  );
  const userDetails = localStorage.getItem("userDetails");
  const currentUser = userDetails && JSON.parse(userDetails);
  const [user] = useState<any>({
    id: "1",
    email: currentUser?.userName,
    name: currentUser?.userName,
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showViewsFor, setShowViewsFor] = useState<string | null>(null);
  const commentSystemRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [viewedComments, setViewedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedComments = localStorage.getItem("comments");
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      const threaded = parseThreadedComments(parsedComments);
      setComments(threaded);
    }

    const savedViewedComments = localStorage.getItem("viewedComments");
    if (savedViewedComments) {
      setViewedComments(new Set(JSON.parse(savedViewedComments)));
    }
  }, []);
  const fetchThreadedComment = async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/InternalDiscussion/stage/${stage}/${stageItemId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transformedComments = transformApiComments(response.data);
      const sortedComments = transformedComments.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      const threadedComments = buildThreadedComments(sortedComments);
      setComments(threadedComments);
    } catch (error) {
      console.error("Error fetching comments :", error);
    }
  };
  useEffect(() => {
    fetchThreadedComment();
  }, []);

  const transformApiComments = (apiComments: any[]): Comment[] => {
    return apiComments.map((apiComment) => ({
      id: apiComment.id,
      content: apiComment.comment,
      user_id: apiComment.userCreates,
      parent_id: apiComment.parent || null,
      created_at: apiComment.dateCreated,
      updated_at: apiComment.dateUpdated,
      user: {
        email: `${apiComment.userName}`,
        name: `${apiComment.userName}`,
      },
      views: (apiComment.seenBy || "").split(",").map((userName: string) => ({
        userId: userName.trim(),
        userEmail: userName.trim(),
        viewedAt: new Date().toISOString(), // Fallback date
      })),
      replies: [],
    }));
  };

  const buildThreadedComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];
    comments.forEach((comment) => commentMap.set(comment.id, comment));

    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const commentId = entry.target.getAttribute("data-comment-id");
          if (commentId) {
            handleCommentSeen(commentId);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, options);

    const commentElements = document.querySelectorAll("[data-comment-id]");
    commentElements.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [comments]);

  const handleCommentSeen = async (commentId: string) => {
    // Check if the comment has already been viewed
    if (viewedComments.has(commentId)) {
      return;
    }

    // Find the comment in the comments array
    const comment = comments.find((c) => c.id === commentId);

    // If the comment doesn't exist or the current user is the comment author, return
    if (!comment || comment.user.email === currentUser.userName) {
      return;
    }

    // Check if the current user has already viewed the comment
    const hasSeen = comment.views?.some(
      (view) => view.userEmail === currentUser.userName
    );

    if (!hasSeen) {
      try {
        // Get the access token from localStorage
        const accessToken = localStorage.getItem("access_token");

        // Make the API call to mark the comment as seen
        const response = await axios.post(
          "http://localhost:4321/api/sales/update-seen-comment",
          {
            commentId: commentId,
            userName: currentUser.userName,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If the API call is successful, update the state and localStorage
        if (response.data.statusCode === 200) {
          // Add the commentId to the viewedComments set
          setViewedComments((prev) => {
            const newSet = new Set(prev);
            newSet.add(commentId);

            return newSet;
          });

          // Update the comments array to reflect the new view
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    views: [
                      ...(c.views || []),
                      {
                        userId: currentUser.userName,
                        userEmail: currentUser.userName,
                        viewedAt: new Date().toISOString(),
                      },
                    ],
                  }
                : c
            )
          );
        }
      } catch (error) {
        console.error("Error marking comment as seen:", error);
      }
      fetchThreadedComment();
    }
  };

  const parseThreadedComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    flatComments.forEach((comment) => {
      const threadedComment = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(threadedComment);
        } else {
          rootComments.push(threadedComment);
        }
      } else {
        rootComments.push(threadedComment);
      }
    });

    return rootComments;
  };

  const flattenComments = (threadedComments: Comment[]): Comment[] => {
    const flat: Comment[] = [];
    const flatten = (comment: Comment) => {
      flat.push(comment);
      comment.replies.forEach((reply) => flatten(reply));
    };
    threadedComments.forEach((comment) => flatten(comment));
    return flat;
  };

  const saveComments = (newComments: Comment[]) => {
    const flatComments = flattenComments(newComments);

    setComments(newComments);
  };

  const canEditComment = (comment: Comment): boolean => {
    const now = new Date();
    const created = new Date(comment.created_at);
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24 && comment.replies.length === 0;
  };

  const handleSeenClick = (commentId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const currentUser = user;
    const comment = comments.find((c) => c.id === commentId);

    if (comment && comment.user_id === currentUser.id) {
      return;
    }

    const now = new Date().toISOString();

    const updateCommentViews = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          const existingView = comment.views?.find(
            (v) => v.userId === currentUser.id
          );
          if (!existingView) {
            return {
              ...comment,
              views: [
                ...(comment.views || []),
                {
                  userId: currentUser.id,
                  userEmail: currentUser.email,
                  viewedAt: now,
                },
              ],
              replies: updateCommentViews(comment.replies),
            };
          }
        }
        return {
          ...comment,
          replies: updateCommentViews(comment.replies),
        };
      });
    };

    const updatedComments = updateCommentViews(comments);
    saveComments(updatedComments);
    setShowViewsFor(showViewsFor === commentId ? null : commentId);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to comment");
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        "${process.env.REACT_APP_API_BASE_URL}/InternalDiscussion",
        {
          userCreated: "1",
          userUpdated: "1",
          comment: newComment,
          stage: stage,
          stageItemId: stageItemId,
          seenBy: "",
          userName: "Radhika",
        }
      );
      fetchThreadedComment();
      const apiComment = response.data;
      const newCommentObj: Comment = {
        id: apiComment.id, // Use API-provided ID
        content: apiComment.comment,
        user_id: user.id,
        parent_id: null,
        created_at: apiComment.dateCreated,
        updated_at: apiComment.dateUpdated,
        user: {
          email: user.email,
          name: user.name,
        },
        views: [],
        replies: [],
      };

      const updatedComments = [newCommentObj, ...comments];
      saveComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to create comment. Please try again.");
    }
  }

  async function handleEdit(
    commentId: string,
    stage: string,
    stageItemId: string
  ) {
    if (!user) return;

    const accessToken = localStorage.getItem("access_token");
    try {
      const payload = {
        id: commentId,
        data: {
          comment: editContent,
          stage: stage,
          stageItemId: stageItemId,
        },
      };

      const response = await axios.post(
        "http://localhost:4321/api/sales/update-sales-thread-comment",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const updatedComment = response.data;

      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: updatedComment.data.comment,
              stage: updatedComment.data.stage,
              stageItemId: updatedComment.data.stageItemId,
              updated_at: new Date().toISOString(),
              replies: updateComment(comment.replies),
            };
          }
          return {
            ...comment,
            replies: updateComment(comment.replies),
          };
        });
      };

      const updatedComments = updateComment(comments);
      saveComments(updatedComments);

      setEditingId(null);
      setEditContent("");
      setActiveMenu(null);
      fetchThreadedComment();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return;

    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/InternalDiscussion/${commentId}`
      );

      // if (response.data.statusCode !== 200) {
      //   throw new Error("Failed to delete the comment");
      // }

      const filterComments = (comments: Comment[]): Comment[] => {
        return comments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: filterComments(comment.replies),
          }));
      };

      const updatedComments = filterComments(comments);
      saveComments(updatedComments);
      setActiveMenu(null);
      fetchThreadedComment();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  }

  async function handleReply(parentId: string) {
    console.log(parentId, "parent:::");
    if (!user) {
      alert("Please sign in to reply");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    const replyContent = replyContents[parentId] || "";
    if (!replyContent.trim()) return;

    try {
      // Send reply to the backend
      const response = await axios.post(
        "${process.env.REACT_APP_API_BASE_URL}/InternalDiscussion",
        {
          comment: replyContent,
          stage: stage,
          parent: parentId,
          userName: "Radhika",
          stageItemId: stageItemId,
          seenBy: "", // Use the dynamic parentId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.statusCode === 200) {
        const apiReply = response.data;
        const replyComment: Comment = {
          id: apiReply.id, // Use API-provided ID
          content: apiReply.comment,
          user_id: currentUser.userCreated,
          parent_id: parentId, // Use the dynamic parentId
          created_at: apiReply.dateCreated,
          updated_at: apiReply.dateUpdated,
          user: {
            email: currentUser.seenBy,
            name: currentUser.seenBy,
          },
          views: [],
          replies: [],
        };
        const addReply = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [replyComment, ...comment.replies], // Add the reply to the parent's replies
              };
            }
            return {
              ...comment,
              replies: addReply(comment.replies), // Recursively update replies
            };
          });
        };

        const updatedComments = addReply(comments);

        saveComments(updatedComments); // Save the updated comments to local storage
        setReplyingTo(null); // Reset the replying state
        setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
        setEditingId(null);
        setEditContent(""); // Clear the reply input
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    }
    fetchThreadedComment();
  }

  return (
    <div className="mt-2  p-2" ref={commentSystemRef}>
      <div className="mb-8">
        {/* <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
           Comments 
        </h2>  */}

        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 z-10" // z-10 for lower z-index
          >
            Comment
          </button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              data-comment-id={comment.id}
              className="comment-container"
            >
              <SingleComment
                key={comment.id}
                comment={comment}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
