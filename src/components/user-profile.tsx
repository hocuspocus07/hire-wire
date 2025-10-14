"use client"

import {
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Github,
  MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  name: string
  title?: string
  location?: string
  avatarUrl?: string
  bio?: string
  skills: string[]
  email: string
  phone?: string
  socials?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
}

interface UserProfileCardProps {
  user: User
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30">
      {/* Header Section */}
      <div className="relative h-60 bg-gradient-to-r from-sky-500 to-indigo-600 flex items-end p-6">

        <div className="flex flex-col sm:flex-row items-center sm:items-end w-full max-w-5xl mx-auto gap-6">
          <Avatar className="h-36 w-36 border-4 border-background rounded-full shadow-lg">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="text-white flex-grow text-center sm:text-left">
            <h1 className="text-4xl font-bold">{user.name}</h1>
            {user.title && <p className="opacity-90">{user.title}</p>}
            {user.location && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm opacity-80">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button>Follow</Button>
            <Button variant="outline" className="border-white/50 text-white hover:bg-white/20">
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {user.bio && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{user.bio}</p>
          </section>
        )}

        {user.skills?.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{user.email}</span>
              </a>
            )}
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{user.phone}</span>
              </a>
            )}
            {user.socials?.linkedin && (
              <a
                href={user.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <span>LinkedIn</span>
              </a>
            )}
            {user.socials?.twitter && (
              <a
                href={user.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <span>Twitter</span>
              </a>
            )}
            {user.socials?.github && (
              <a
                href={user.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Github className="h-5 w-5 text-muted-foreground" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
