"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type MetaItem = { label: string; value: string }

export function ProfileHeader({
  name,
  role,
  email,
  imageUrl,
  subtitle,
  meta = [],
  actions,
  className,
}: {
  name: string
  role?: string
  email?: string
  imageUrl?: string
  subtitle?: string
  meta?: MetaItem[]
  actions?: ReactNode
  className?: string
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Card className={cn("p-4 md:p-6", className)}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-balance">{name}</h2>
              <p className="text-sm text-muted-foreground">
                {role ? role : ""}
                {role && email ? " • " : ""}
                {email ? email : subtitle}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>

        {meta.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {meta.map((m) => (
              <div key={m.label} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-sm font-medium">{m.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </motion.div>
  )
}
