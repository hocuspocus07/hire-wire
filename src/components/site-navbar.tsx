"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import { Menu, Bot, LogIn, User } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/utils/actions"

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#rooms", label: "Rooms" },
]

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
    })
  }, [])

  async function handleSignOut() {
    await signOut();
    setUser(null)
    router.push("/")
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <nav className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        {/* Left: Brand */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              HireWire
            </span>
          </Link>
        </motion.div>

        {/* Center: Desktop nav */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2"
        >
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Button 
                asChild 
                variant="ghost" 
                className="relative text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/50 hover:text-foreground group"
              >
                <Link 
                  href={item.href} 
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-3/4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Right: Actions (Desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex items-center gap-2"
        >
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1">
                  <img 
                    src={user.user_metadata?.avatar_url || "/default-avatar.png"} 
                    alt="pfp" 
                    className="h-8 w-8 rounded-full border"
                  />
                  <span className="font-medium">{user.user_metadata?.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/${user.user_metadata.role}/dashboard`}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-sm font-medium gap-2 transition-all duration-200 hover:bg-accent/50"
                asChild
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
              
              <Button 
                className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25"
                asChild
              >
                <Link href="/register" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </motion.div>

        {/* Mobile menu */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex md:hidden items-center gap-2"
        >
          <ModeToggle />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 relative"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] border-l-border/40">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-8 flex flex-col h-full"
              >
                {/* Brand */}
                <div className="mb-8 px-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-2"
                  >
                    <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">HireWire</span>
                  </Link>
                </div>

                {/* Navigation items */}
                <div className="flex flex-col gap-1 flex-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-base font-medium px-4 py-3 rounded-lg transition-all duration-200 hover:bg-accent/50 hover:translate-x-1"
                        asChild
                      >
                        <Link 
                          href={item.href} 
                          aria-current={pathname === item.href ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons / User info */}
                <div className="mt-auto pt-8 pb-4 flex flex-col gap-3 border-t border-border/40">
                  {user ? (
                    <>
                      <Button variant="ghost" className="justify-start" asChild>
<Link href={`/${user.user_metadata.role}/dashboard`}>Dashboard</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start text-red-500" 
                        onClick={handleSignOut}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-center gap-2 font-medium py-3" asChild>
                        <Link href="/login">
                          <LogIn className="h-4 w-4" />
                          Sign in
                        </Link>
                      </Button>
                      
                      <Button 
                        className="w-full justify-center gap-2 font-medium py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        asChild
                      >
                        <Link href="/register">
                          <User className="h-4 w-4" />
                          Sign up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </nav>
    </motion.header>
  )
}
