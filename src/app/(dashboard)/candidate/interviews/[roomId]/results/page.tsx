"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Trophy, Frown } from "lucide-react"

function ResultsDisplay() {
  const searchParams = useSearchParams()
  const score = searchParams.get('score')
  const feedback = searchParams.get('feedback')

  if (!score || !feedback) {
     return (
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
        <Frown className="h-24 w-24 text-destructive drop-shadow-lg" />
        <h1 className="text-4xl font-bold mt-6">Oops!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
            Could not find your results. They may be available on your dashboard.
        </p>
         <Button asChild className="mt-8" size="lg">
           <Link href="/candidate/dashboard">Back to Dashboard</Link>
         </Button>
       </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center"
    >
      <Trophy className="h-24 w-24 text-yellow-400 drop-shadow-lg" />
      <h1 className="text-4xl font-bold mt-6">Interview Complete!</h1>
      <p className="text-muted-foreground mt-2">
        Great job on finishing the interview. Here's your result:
      </p>

      <div className="my-8">
        <p className="text-lg">Your Score</p>
        <p className="text-7xl font-bold text-primary">
          {score}
          <span className="text-3xl text-muted-foreground">/100</span>
        </p>
      </div>

      <Card className="max-w-2xl w-full text-left">
        <CardHeader>
          <CardTitle>AI Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">
            "{feedback}"
          </p>
        </CardContent>
      </Card>

      <Button asChild className="mt-8" size="lg">
        <Link href="/dashboard/interviewee">Back to Dashboard</Link>
      </Button>
    </motion.div>
  )
}

export default function InterviewResultsPage() {
    return (
        <Suspense fallback={<div>Loading results...</div>}>
            <ResultsDisplay />
        </Suspense>
    )
}