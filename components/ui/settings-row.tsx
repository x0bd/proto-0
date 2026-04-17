import * as React from "react"
import { cn } from "@/lib/utils"

interface SettingsRowProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function SettingsRow({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b last:border-0",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
        )}
        <div className="flex flex-col gap-1">
          <div className="font-medium leading-none">{title}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
