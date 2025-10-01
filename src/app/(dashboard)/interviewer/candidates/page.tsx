"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const candidates = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Frontend Developer",
    status: "completed",
    score: 88,
    percentile: 95,
    lastInterview: "2024-01-15",
    experience: "3 years",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Full-Stack Developer",
    status: "completed",
    score: 76,
    percentile: 82,
    lastInterview: "2024-01-14",
    experience: "5 years",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Backend Developer",
    status: "in-progress",
    score: null,
    percentile: null,
    lastInterview: "2024-01-16",
    experience: "2 years",
  },
]

export default function CandidatesPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const roles = useMemo(() => ["all", ...Array.from(new Set(candidates.map((c) => c.role)))], [])

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase().trim()
    const matchesQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    const matchesRole = roleFilter === "all" || c.role === roleFilter
    return matchesQ && matchesRole
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">Candidates</h1>
        <Button variant="outline">Export</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search candidates by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "all" ? "All Roles" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead className="min-w-[160px]">Role</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentile</TableHead>
                <TableHead>Last Interview</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const initials = c.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src="/candidate.png" alt={c.name} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.role}</TableCell>
                    <TableCell className="text-sm">{c.experience}</TableCell>
                    <TableCell className="text-sm">
                      {c.status === "in-progress" ? (
                        <span className="rounded-md border px-2 py-0.5 text-xs">In Progress</span>
                      ) : (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">Completed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{c.score != null ? `${c.score}%` : "-"}</TableCell>
                    <TableCell className="text-sm">{c.percentile != null ? `Top ${c.percentile}%` : "-"}</TableCell>
                    <TableCell className="text-sm">{c.lastInterview}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
