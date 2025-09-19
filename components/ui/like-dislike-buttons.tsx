/**
 * LIKE/DISLIKE BUTTONS COMPONENT
 * 
 * Interactive voting buttons for subjects and comments
 * Data source: Props from parent components (SubjectCard, CommentItem)
 * User data: User authentication status from AuthContext
 * API integration: Sends vote requests to like/dislike endpoints
 * 
 * Features:
 * - Visual feedback for user's current vote status
 * - Real-time counter updates after voting
 * - Prevents voting for non-authenticated users
 * - Handles both subjects and comments with different API endpoints
 * - Smart button states (active when user has voted)
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

/**
 * Props for LikeDislikeButtons component
 * Data flow: Parent component → Props → Button interactions → API calls → State updates
 */
interface LikeDislikeButtonsProps {
  itemId: string              // Subject ID or Comment ID for API calls
  itemType: "subject" | "comment"  // Determines which API endpoint to use
  likeCount: number           // Current net likes (likes - dislikes) from database
  userLiked: boolean          // Whether current user has liked this item
  userDisliked: boolean       // Whether current user has disliked this item
  onLikeChange?: (newCount: number, userLiked: boolean, userDisliked: boolean) => void  // Callback for parent updates
}

export function LikeDislikeButtons({
  itemId,
  itemType,
  likeCount,
  userLiked,
  userDisliked,
  onLikeChange
}: LikeDislikeButtonsProps) {
  // Local state management for UI responsiveness
  const [isLoading, setIsLoading] = useState(false)
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)
  const [currentUserLiked, setCurrentUserLiked] = useState(userLiked)
  const [currentUserDisliked, setCurrentUserDisliked] = useState(userDisliked)
  
  // Get user authentication status from AuthContext
  const { user } = useAuth()

  /**
   * Handles like/dislike button clicks
   * Data flow: Button click → API call → Database update → UI update
   * User data: User ID from auth context, action from button type
   */
  const handleLikeDislike = async (action: "like" | "dislike") => {
    // Prevent action if user not authenticated or request in progress
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      // Determine API endpoint based on item type
      // Subjects: /api/subjects/[id]/like
      // Comments: /api/subjects/[subjectId]/comments/[commentId]/like
      const endpoint = itemType === "subject" 
        ? `/api/subjects/${itemId}/like`
        : `/api/subjects/${itemId.split('-')[0]}/comments/${itemId.split('-')[1]}/like`

      // Send vote data to API endpoint
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action: action
        }),
      })

      if (response.ok) {
        // Update local state and parent component with API response
        const data = await response.json()
        setCurrentLikeCount(data.like_count)
        setCurrentUserLiked(data.user_liked)
        setCurrentUserDisliked(data.user_disliked)
        onLikeChange?.(data.like_count, data.user_liked, data.user_disliked)
      } else {
        console.error("Failed to update like/dislike")
      }
    } catch (error) {
      console.error("Error updating like/dislike:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show read-only version for non-authenticated users
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          <ThumbsDown className="h-4 w-4" />
          <span className="font-medium">{currentLikeCount}</span>
        </div>
      </div>
    )
  }

  // Interactive buttons for authenticated users
  return (
    <div className="flex items-center gap-1">
      {/* Like button - active styling when user has liked */}
      <Button
        variant={currentUserLiked ? "default" : "ghost"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation() // Prevent parent click events (e.g., opening subject)
          handleLikeDislike("like")
        }}
        disabled={isLoading}
        className="h-8 px-2 gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>

      {/* Counter display - shows net likes (likes - dislikes) */}
      <span className="px-2 text-sm font-medium min-w-[2rem] text-center">
        {currentLikeCount}
      </span>

      {/* Dislike button - active styling when user has disliked */}
      <Button
        variant={currentUserDisliked ? "default" : "ghost"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation() // Prevent parent click events
          handleLikeDislike("dislike")
        }}
        disabled={isLoading}
        className="h-8 px-2 gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}