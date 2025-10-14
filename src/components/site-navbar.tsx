"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import { Menu, Bot, LogIn, User, LayoutDashboard, Users, ClipboardPenLine, FileText, LogOut } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/utils/actions"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data?.user
      setUser(currentUser ?? null)
      setRole(currentUser?.user_metadata?.role ?? null)
    })
  }, [])

  async function handleSignOut() {
    await signOut()
    setUser(null)
    router.push("/")
  }

  const getInitials = (name: string) =>
    (name || user?.email || "U")
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const getImageUrl = () => user?.user_metadata?.avatar_url || null

  const roleNav =
    role === "candidate"
      ? [
          { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/candidate/interviews", label: "My Interviews", icon: FileText },
          { href: "/public-interviews", label: "Public Interviews", icon: ClipboardPenLine },
        ]
      : role === "interviewer"
      ? [
          { href: "/interviewer/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/interviewer/interviews", label: "My Interviews", icon: FileText },
          { href: "/public-interviews", label: "Public Interviews", icon: ClipboardPenLine },
        ]
      : []

  const publicNav = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#rooms", label: "Rooms" },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
    >
      <nav className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">HireWire</span>
        </Link>

        {/* Center nav (Desktop) */}
        {!user && (
          <div className="hidden md:flex gap-2 absolute left-1/2 -translate-x-1/2">
            {publicNav.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Button
                  asChild
                  variant="ghost"
                  className="text-sm font-medium hover:bg-accent/40 transition-all"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Right actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src={getImageUrl() || ""} />
                    <AvatarFallback>{getInitials(user.user_metadata?.name)}</AvatarFallback>
                  </Avatar>
                  <span>{user.user_metadata?.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {roleNav.map((item) => (
                  <DropdownMenuItem asChild key={item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" /> {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600"><LogOut className="w-4 h-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-1" /> Sign in
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  <User className="h-4 w-4 mr-1" /> Sign up
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[320px] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-border/40">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">HireWire</span>
                  </Link>
                </div>

                {/* Nav items */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                  {user ? (
                    <>
                      <p className="text-sm text-muted-foreground px-2 mb-2 uppercase">
                        {role === "candidate" ? "Candidate Menu" : "Interviewer Menu"}
                      </p>
                      {roleNav.map((item) => (
                        <Button
                          key={item.href}
                          variant={pathname === item.href ? "secondary" : "ghost"}
                          asChild
                          className="justify-start w-full gap-3"
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground px-2 mb-2 uppercase">Explore</p>
                      {publicNav.map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          asChild
                          className="justify-start w-full text-base"
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ))}
                    </>
                  )}
                </div>

                {/* Footer actions */}
                <div className="border-t border-border/40 p-4 flex flex-col gap-3">
                  {user ? (
                    <Button variant="destructive" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Button asChild>
                        <Link href="/register">
                          <User className="h-4 w-4 mr-2" /> Sign up
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/login">
                          <LogIn className="h-4 w-4 mr-2" /> Sign in
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}