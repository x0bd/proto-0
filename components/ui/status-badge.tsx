import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "error" | "info" | "default"

interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  status?: StatusType
}

export function StatusBadge({ status = "default", className, ...props }: StatusBadgeProps) {
  const statusStyles = {
    success: "border-transparent bg-success text-success-foreground",
    warning: "border-transparent bg-warning text-warning-foreground",
    error: "border-transparent bg-destructive text-destructive-foreground",
    info: "border-transparent bg-info text-info-foreground",
    default: "",
  }

  return (
    <Badge
      variant={status === "default" ? "default" : "outline"}
      className={cn(statusStyles[status], className)}
      {...props}
    />
  )
}
