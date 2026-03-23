import * as React from "react"
import { cn } from "@/lib/utils"
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

export type HintType = "info" | "success" | "warning" | "error"

interface InlineHintProps extends React.ComponentProps<"div"> {
  type?: HintType
  title?: string
}

export function InlineHint({
  type = "info",
  title,
  children,
  className,
  ...props
}: InlineHintProps) {
  const icons = {
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
  }

  const styles = {
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm",
        styles[type],
        className
      )}
      {...props}
    >
      <div className="shrink-0 opacity-80 mt-0.5">{icons[type]}</div>
      <div className="flex flex-col gap-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
