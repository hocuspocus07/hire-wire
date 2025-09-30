"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-6xl px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-8"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block text-xs tracking-widest text-muted-foreground uppercase bg-muted/50 px-3 py-1 rounded-full border"
          >
            HireWire • AI-Powered Interview Rooms
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-balance text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            Run role‑based{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI interviews
            </span>{" "}
            with shareable rooms
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-pretty text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            Create a room as an Interviewer, share a link with candidates, and preview the verified Questions tab and live
            Scoreboard.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button size="lg" className="px-8 py-6 text-lg font-semibold">
              Create Interview Room
            </Button>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Input 
                className="w-full sm:w-80 h-12 text-base" 
                placeholder="Paste invite link to preview" 
                aria-label="Invite link" 
              />
              <Button variant="secondary" className="gap-2 h-12 px-6">
                Preview Flow
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}