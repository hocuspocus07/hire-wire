"use client"

import { Mail, Phone, Linkedin, Twitter, Github, MapPin } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
  if (!user) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants :Variants={
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  }

  const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-lg p-3 text-sm transition-colors hover:bg-muted"
    >
      <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
      <span className="font-medium text-foreground">{label}</span>
    </a>
  )

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column (Sidebar) */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="shadow-sm sticky top-8">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-4xl">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h1 className="mt-5 text-2xl font-bold">{user.name}</h1>
                {user.title && <p className="mt-1 text-md text-muted-foreground">{user.title}</p>}
                {user.location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </CardContent>
              <Separator />
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Contact & Socials</h3>
                <div className="space-y-2">
                  {user.email && <SocialLink href={`mailto:${user.email}`} icon={Mail} label={user.email} />}
                  {user.phone && <SocialLink href={`tel:${user.phone}`} icon={Phone} label={user.phone} />}
                  {(user.socials?.linkedin || user.socials?.twitter || user.socials?.github) && <Separator className="my-3" />}
                  {user.socials?.linkedin && <SocialLink href={user.socials.linkedin} icon={Linkedin} label="LinkedIn" />}
                  {user.socials?.github && <SocialLink href={user.socials.github} icon={Github} label="GitHub" />}
                  {user.socials?.twitter && <SocialLink href={user.socials.twitter} icon={Twitter} label="Twitter" />}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column (Main Content) */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {user.bio && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{user.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {user.skills?.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-4 py-1.5 text-base font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}