"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle } from "lucide-react"
import userProfileService, { type UserProfile } from "@/services/user-profile-service"
import { useRouter } from "next/navigation"

export default function UserProfileIndicator() {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    const profile = userProfileService.getActiveProfile()
    setActiveProfile(profile)
  }, [])

  // Generar iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!activeProfile) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push("/perfiles")}>
        <UserCircle className="h-5 w-5" />
        <span className="text-xs">Crear perfil</span>
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push("/perfiles")}>
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">{getInitials(activeProfile.name)}</AvatarFallback>
        {activeProfile.avatar && (
          <AvatarImage src={activeProfile.avatar || "/placeholder.svg"} alt={activeProfile.name} />
        )}
      </Avatar>
      <span className="text-xs truncate max-w-[80px]">{activeProfile.name}</span>
    </Button>
  )
}
