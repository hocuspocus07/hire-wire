"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { Camera, Loader2 } from "lucide-react"
import { Github, Linkedin, Twitter } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onProfileUpdate: (updatedUser: any) => void
  type: "candidate" | "interviewer"
}

export function ProfileEditDialog({ open, onOpenChange, user, onProfileUpdate, type }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    company: "",
    position: "",
    skills: "",
    phone: "",
    socials: {
      github: "",
      linkedin: "",
      twitter: "",
    },
  })

  const supabase = getSupabaseBrowser()

  const triggerFile = () => fileRef.current?.click()

  const getInitials = (name: string) =>
    (name || user?.email || "U")
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!open || !user?.id) return
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("[v0] fetch user error:", error)
        return
      }

      setFormData({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        company: data.company || "",
        position: data.position || "",
        phone: data.phone || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || "",
        socials: data.socials || { github: "", linkedin: "", twitter: "" },
      })

    }
    fetchUserData()
  }, [open, user?.id])
  const getImageUrl = () => {
    const avatarUrl = user?.user_metadata?.avatar_url
    if (!avatarUrl) return null
    return avatarUrl
  }

  const deleteOld = async () => {
    if (user?.user_metadata?.avatar_path) {
      try {
        await supabase.storage.from("avatars").remove([user.user_metadata.avatar_path])
      } catch (e) {
        console.error("[v0] delete old avatar error:", e)
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Max 2MB image size")
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      const filePath = `profile-pictures/${fileName}`
      const bucket = "avatars"

      await deleteOld()

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })
      if (uploadError) throw uploadError

      // Signed URL (1 year)
      const { data: signed, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365)
      if (signErr) throw signErr

      const { error: updateErr } = await supabase.auth.updateUser({
        data: { avatar_url: signed.signedUrl, avatar_path: filePath },
      })
      if (updateErr) {
        // cleanup on failure
        await supabase.storage.from(bucket).remove([filePath])
        throw updateErr
      }

      onProfileUpdate({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: signed.signedUrl,
          avatar_path: filePath,
        },
      })
      toast.success("Profile image uploaded successfully")
    } catch (err: any) {
      console.error("[v0] upload avatar error:", err)
      alert(`Error uploading image: ${err.message || "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from("users").update({
        email: formData.email,
        name: formData.name,
        bio: formData.bio,
        company: formData.company,
        position: formData.position,
        skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()) : null,
        phone: formData.phone,
        socials: formData.socials,
      }).eq("id", user.id)

      if (error) throw error

      onProfileUpdate({
        ...user,
        email: formData.email,
        user_metadata: {
          ...user.user_metadata,
          name: formData.name,
          bio: formData.bio,
          company: formData.company,
          position: formData.position,
          skills: formData.skills,
          phone: formData.phone,
          socials: formData.socials,
        },
      })
      onOpenChange(false)
      toast.success("Profile updated successfully")
    } catch (err: any) {
      console.error("[v0] update profile error:", err)
      alert(`Error updating profile: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[calc(100vw-2rem)]
          sm:max-w-[500px]
          max-h-[90vh]
          overflow-y-auto
          p-4 sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile info and photo. Private avatars bucket is used.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-border">
                <AvatarImage src={getImageUrl() || ""} alt={formData.name || "Avatar"} />
                <AvatarFallback className="text-lg">{getInitials(formData.name)}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={triggerFile}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow hover:bg-primary/90 disabled:opacity-50"
                aria-label="Upload profile photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              JPG/PNG, max 2MB. Private storage with signed URL.
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            {type === "interviewer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </>
            )}
            {type === "candidate" && (
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, TypeScript"
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
            )}
            {/* Socials */}
            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="GitHub URL"
                    value={formData.socials.github}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, github: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.socials.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, linkedin: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Twitter URL"
                    value={formData.socials.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, twitter: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
