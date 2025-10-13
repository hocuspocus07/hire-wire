"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  confirmText: string
  onConfirm: () => void
  message?: string
}

export function ConfirmDeleteModal({ open, setOpen, confirmText, onConfirm, message }: Props) {
  const [input, setInput] = useState("")

  const handleConfirm = () => {
    if (input === confirmText) {
      onConfirm()
      setOpen(false)
      toast.success("Deleted successfully!")
      setInput("")
    } else {
      toast.error("Confirmation text does not match")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">Confirm Deletion</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          {message || `Type "${confirmText}" to confirm deletion. This action cannot be undone.`}
        </p>

        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type confirmation text here"
          onPaste={(e) => e.preventDefault()} // ❌ Disables paste
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={input !== confirmText}
          >
            Confirm Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
