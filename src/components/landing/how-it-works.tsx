"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, Share2, CheckCircle2 } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: ClipboardList,
      title: "1. Create room",
      desc: "As an Interviewer, configure role and interview type, then generate a link.",
    },
    {
      icon: Share2,
      title: "2. Share invite",
      desc: "Send the link to candidates. They'll verify before starting.",
    },
    {
      icon: CheckCircle2,
      title: "3. Verify → start",
      desc: "After verification, the Questions tab unlocks and the Scoreboard appears.",
    },
  ]

  return (
    <section className="w-full py-20 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple three-step process to conduct AI-powered interviews
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="p-6 h-full border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <s.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" className="px-8 py-6 text-lg font-semibold">
            Get Started — It's Free
          </Button>
        </div>
      </div>
    </section>
  )
}