"use client"

import { useCallback } from "react"

const STORAGE_KEY = "builder_studio_user"

export type UserRole = "Player-1" | "Player-2" | "Player-3" | "Admin"

export function useAuth() {
  const getCurrentUser = useCallback((): UserRole | null => {
    if (typeof window === "undefined") return null
    return (localStorage.getItem(STORAGE_KEY) as UserRole) || null
  }, [])

  const login = useCallback((user: UserRole) => {
    localStorage.setItem(STORAGE_KEY, user)
    window.location.href = user === "Admin" ? "/admin" : "/create"
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.href = "/login"
  }, [])

  return { getCurrentUser, login, logout }
}
