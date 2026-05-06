import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div className={cn("md:px-[70px] md:py-[40px]", className)} {...props}>
      {children}
    </div>
  )
}
