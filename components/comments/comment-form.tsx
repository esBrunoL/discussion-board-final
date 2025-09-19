"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>
  onCancel?: () => void
  placeholder?: string
  submitText?: string
  loading?: boolean
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts...",
  submitText = "Post Comment",
  loading = false,
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!content.trim()) {
      setError("Comment cannot be empty")
      return
    }

    if (content.length > 1000) {
      setError("Comment must be 1000 characters or less")
      return
    }

    const success = await onSubmit(content.trim())
    if (success) {
      setContent("")
    } else {
      setError("Failed to post comment. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        className="resize-none"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{content.length}/1000 characters</p>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading ? "Posting..." : submitText}
          </Button>
        </div>
      </div>
    </form>
  )
}
