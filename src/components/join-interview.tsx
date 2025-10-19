"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
interface JoinInterviewModalProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export default function JoinInterviewModal({ open, setOpen }: JoinInterviewModalProps) {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    const handleJoin = async () => {
        if (!code.trim()) {
            toast.error("Please enter a valid interview code.")
            return
        }

        try {
            setLoading(true)
            const { data, error } = await supabase.from("rooms").select("code").eq("code", code).single()
            if (error || !data) toast.error("Interview not found.")
            else {
                toast.success("Joining interview...")
                router.push(`/candidate/interviews/${code.toLocaleLowerCase()}`)
            }
        } catch (err) {
            console.error(err)
            toast.error("Interview not found.")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join an Interview</DialogTitle>
                    <DialogDescription>
                        Enter the unique room code shared with you to join the interview session.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-3">
                    <Input
                        placeholder="Enter room code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="tracking-widest text-center font-mono text-lg"
                        maxLength={6}
                    />
                    <Link href="/public-interviews" className="flex items-center justify-center text-sm text-gray-300 hover:text-foreground">or join a public interview</Link>

                    <Button
                        onClick={handleJoin}
                        disabled={loading || !code.trim()}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Joining...
                            </>
                        ) : (
                            "Join Interview"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
