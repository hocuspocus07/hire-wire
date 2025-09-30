"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users2, Link2, SquarePen, ShieldCheck, BarChart3 } from "lucide-react"

const items = [
  {
    icon: Users2,
    title: "Role‑based access",
    desc: "Interviewer creates and manages rooms; interviewees join via link.",
  },
  { icon: Link2, title: "Room links", desc: "Share a unique link. We gate questions until verification." },
  { icon: ShieldCheck, title: "Verified flow", desc: "Once verified, candidates see the Questions tab." },
  { icon: BarChart3, title: "Scoreboard preview", desc: "Live scores showcased beside the chat." },
  { icon: SquarePen, title: "Clean UI", desc: "Minimal, responsive, and accessible components." },
]

export function Features() {
  return (
    <section className="w-full py-20 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold">Why Crisp</h2>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Frontend Preview
          </Badge>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="p-6 h-full border hover:border-primary/20 transition-all duration-300 hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <it.icon className="size-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{it.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}