"use client"

/* eslint-disable react/no-multi-comp */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

type CollapsibleContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("Collapsible components must be used within <Collapsible>.")
  }
  return context
}

type CollapsibleProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Collapsible({ children, open, defaultOpen = false, onOpenChange }: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const resolvedOpen = open ?? uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [onOpenChange, open]
  )

  return (
    <CollapsibleContext.Provider value={{ open: resolvedOpen, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  )
}

type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ asChild = false, onClick, type, ...props }, ref) => {
    const { open, setOpen } = useCollapsibleContext()
    const Comp: React.ElementType = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref as React.Ref<any>}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event)
          if (!event.defaultPrevented) {
            setOpen(!open)
          }
        }}
        {...(!asChild ? { type: type ?? "button" } : {})}
        {...props}
      />
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    const { open } = useCollapsibleContext()
    if (!open) return null

    return (
      <div ref={ref} data-state={open ? "open" : "closed"} {...props}>
        {children}
      </div>
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
