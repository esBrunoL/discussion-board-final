"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SubjectsList } from "@/components/subjects/subjects-list"
import { SubjectDetail } from "@/components/subjects/subject-detail"
import type { Subject } from "@/lib/db"

export default function HomePage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject)
  }

  const handleBackToList = () => {
    setSelectedSubject(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {selectedSubject ? (
          <SubjectDetail subject={selectedSubject} onBack={handleBackToList} />
        ) : (
          <SubjectsList onSubjectClick={handleSubjectClick} />
        )}
      </main>
    </div>
  )
}
