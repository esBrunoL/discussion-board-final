import type { AuthUser, LoginCredentials, RegisterCredentials } from "./auth"
import type { Subject, Comment } from "./db"

const API_BASE = "/api"

// Auth API functions
export async function apiLogin(credentials: LoginCredentials): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Login API error:", error)
    return null
  }
}

export async function apiRegister(credentials: RegisterCredentials): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Register API error:", error)
    throw error
  }
}

// Subjects API functions
export async function apiGetSubjects(userId?: string): Promise<Subject[]> {
  try {
    const url = userId ? `${API_BASE}/subjects?userId=${userId}` : `${API_BASE}/subjects`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Failed to fetch subjects")
    }

    const data = await response.json()
    return data.subjects
  } catch (error) {
    console.error("Get subjects API error:", error)
    return []
  }
}

export async function apiCreateSubject(title: string, description: string, author: AuthUser): Promise<Subject | null> {
  try {
    const response = await fetch(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        author_id: author.id,
        author_username: author.username,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.subject
  } catch (error) {
    console.error("Create subject API error:", error)
    return null
  }
}

// Comments API functions
export async function apiGetComments(subjectId: number): Promise<Comment[]> {
  try {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}/comments`)

    if (!response.ok) {
      throw new Error("Failed to fetch comments")
    }

    const data = await response.json()
    return data.comments
  } catch (error) {
    console.error("Get comments API error:", error)
    return []
  }
}

export async function apiCreateComment(
  subjectId: number,
  content: string,
  author: AuthUser,
  parentCommentId?: number,
): Promise<Comment | null> {
  try {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        author_id: author.id,
        author_username: author.username,
        parent_comment_id: parentCommentId,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.comment
  } catch (error) {
    console.error("Create comment API error:", error)
    return null
  }
}
