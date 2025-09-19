"use client"

import { useState, useEffect } from "react"
import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Comment } from "@/lib/db"
import { useAuth } from "@/contexts/auth-context"
import { MessageSquare, SortAsc, SortDesc } from "lucide-react"
import { apiGetComments, apiCreateComment } from "@/lib/api"

interface CommentsSectionProps {
  subjectId: number
}

export function CommentsSection({ subjectId }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  // Build threaded comment structure
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>()
    const rootComments: Comment[] = []

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build tree structure
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!

      if (comment.parent_comment_id === null) {
        rootComments.push(commentWithReplies)
      } else {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentWithReplies)
        }
      }
    })

    // Sort root comments
    const sortedRoot = rootComments.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    // Sort replies within each comment
    const sortReplies = (comment: Comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateA - dateB // Always oldest first for replies
        })
        comment.replies.forEach(sortReplies)
      }
    }

    sortedRoot.forEach(sortReplies)
    return sortedRoot
  }

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true)
      const fetchedComments = await apiGetComments(subjectId)
      setComments(fetchedComments)
      setLoading(false)
    }

    loadComments()
  }, [subjectId])

  const handleAddComment = async (content: string): Promise<boolean> => {
    if (!user) return false

    const newComment = await apiCreateComment(subjectId, content, user)
    if (newComment) {
      setComments((prev) => [...prev, newComment])
      return true
    }
    return false
  }

  const handleReply = async (parentId: number, content: string): Promise<boolean> => {
    if (!user) return false

    const newReply = await apiCreateComment(subjectId, content, user, parentId)
    if (newReply) {
      setComments((prev) => [...prev, newReply])
      return true
    }
    return false
  }

  const threadedComments = buildCommentTree(comments)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </div>

        {comments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="gap-2"
          >
            {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </Button>
        )}
      </div>

      {user ? (
        <div className="bg-card rounded-lg p-4 border">
          <CommentForm onSubmit={handleAddComment} />
        </div>
      ) : (
        <Alert>
          <AlertDescription>Please sign in to join the discussion and post comments.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {threadedComments.length > 0 ? (
          threadedComments.map((comment) => <CommentItem key={comment.id} comment={comment} onReply={handleReply} />)
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet.</p>
            {user && <p className="text-sm text-muted-foreground mt-1">Be the first to share your thoughts!</p>}
          </div>
        )}
      </div>
    </div>
  )
}
