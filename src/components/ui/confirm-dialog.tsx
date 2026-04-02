"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { AlertTriangle, Info, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "info",
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = variant === "danger" ? Trash2 : variant === "warning" ? AlertTriangle : Info
  
  const variantStyles = {
    danger: "bg-red-50 text-red-600 border-red-100",
    warning: "bg-orange-50 text-orange-600 border-orange-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
  }

  const buttonStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-orange-500 hover:bg-orange-600 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-orange-100">
        <DialogHeader className="flex flex-col items-center gap-2 pt-4">
          <div className={cn("p-3 rounded-full border", variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl text-center font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-center gap-3 mt-4 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 min-h-[44px]"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={cn("flex-1 min-h-[44px]", buttonStyles[variant])}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
