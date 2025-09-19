"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CommentsSection } from "@/components/comments/comments-section"
import type { Subject } from "@/lib/db"
import { ArrowLeft, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SubjectDetailProps {
  subject: Subject
  onBack: () => void
}

export function SubjectDetail({ subject, onBack }: SubjectDetailProps) {
  const timeAgo = formatDistanceToNow(new Date(subject.created_at), { addSuffix: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to discussions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-balance">{subject.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-muted text-xs">
                  {subject.author_username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>by {subject.author_username}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </CardHeader>

        {subject.description && (
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed text-pretty">{subject.description}</p>
            </div>
          </CardContent>
        )}
      </Card>

      <CommentsSection subjectId={subject.id} />
    </div>
  )
}
