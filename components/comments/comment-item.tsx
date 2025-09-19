"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { LikeDislikeButtons } from "@/components/ui/like-dislike-buttons"
import type { Comment } from "@/lib/db"
import { useAuth } from "@/contexts/auth-context"
import { Reply, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CommentForm } from "./comment-form"

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: number, content: string) => Promise<boolean>
  level?: number
}

export function CommentItem({ comment, onReply, level = 0 }: CommentItemProps) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  const handleReply = async (content: string) => {
    setIsReplying(true)
    const success = await onReply(comment.id, content)
    setIsReplying(false)

    if (success) {
      setShowReplyForm(false)
    }
    return success
  }

  const maxLevel = 3 // Maximum nesting level for replies
  const isMaxLevel = level >= maxLevel

  return (
    <div className={`${level > 0 ? "ml-6 border-l-2 border-muted pl-4" : ""}`}>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-muted text-sm">
                {comment.author_username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{comment.author_username}</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-pretty">{comment.content}</p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {user && !isMaxLevel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </Button>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>
                        {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                  )}
                </div>

                <LikeDislikeButtons
                  itemId={`${comment.subject_id}-${comment.id}`}
                  itemType="comment"
                  likeCount={comment.like_count || 0}
                  userLiked={comment.user_liked || false}
                  userDisliked={comment.user_disliked || false}
                />
              </div>

              {showReplyForm && (
                <div className="mt-4">
                  <CommentForm
                    onSubmit={handleReply}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Reply to ${comment.author_username}...`}
                    submitText="Post Reply"
                    loading={isReplying}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
