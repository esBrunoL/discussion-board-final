"use client"

import { useState, useEffect } from "react"
import { SubjectCard } from "./subject-card"
import { CreateSubjectModal } from "./create-subject-modal"
import { Button } from "@/components/ui/button"
import type { Subject } from "@/lib/db"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { apiGetSubjects, apiCreateSubject } from "@/lib/api"

interface SubjectsListProps {
  onSubjectClick: (subject: Subject) => void
}

export function SubjectsList({ onSubjectClick }: SubjectsListProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true)
      const fetchedSubjects = await apiGetSubjects(user?.id?.toString())
      setSubjects(fetchedSubjects)
      setLoading(false)
    }

    loadSubjects()
  }, [user])

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateSubject = async (title: string, description: string): Promise<boolean> => {
    if (!user) return false

    const newSubject = await apiCreateSubject(title, description, user)
    if (newSubject) {
      setSubjects((prev) => [newSubject, ...prev])
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">Discussions</h2>
            <p className="text-muted-foreground">Loading discussions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Discussions</h2>
          <p className="text-muted-foreground">Join the conversation and share your thoughts</p>
        </div>

        {user && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Discussion
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onClick={() => onSubjectClick(subject)} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No discussions found matching your search." : "No discussions yet."}
            </p>
            {user && !searchQuery && (
              <Button onClick={() => setCreateModalOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Start the first discussion
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateSubjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubject}
      />
    </div>
  )
}
