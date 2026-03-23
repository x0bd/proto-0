import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface SectionCardProps extends React.ComponentProps<typeof Card> {
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  action?: React.ReactNode
  contentClassName?: string
}

export function SectionCard({
  title,
  description,
  children,
  footer,
  action,
  className,
  contentClassName,
  ...props
}: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      {children && <CardContent className={contentClassName}>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}
