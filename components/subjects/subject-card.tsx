"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LikeDislikeButtons } from "@/components/ui/like-dislike-buttons"
import type { Subject } from "@/lib/db"
import { MessageSquare, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SubjectCardProps {
  subject: Subject
  onClick: () => void
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const timeAgo = formatDistanceToNow(new Date(subject.created_at), { addSuffix: true })

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-secondary/50" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight text-balance">{subject.title}</h3>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2 text-pretty">{subject.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-muted text-xs">
                  {subject.author_username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">{subject.author_username}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LikeDislikeButtons
              itemId={subject.id.toString()}
              itemType="subject"
              likeCount={subject.like_count || 0}
              userLiked={subject.user_liked || false}
              userDisliked={subject.user_disliked || false}
            />
            
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              {subject.comment_count || 0}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
