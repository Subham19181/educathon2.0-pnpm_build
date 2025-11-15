"use client"

import * as React from "react"

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue = "", value, onValueChange, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue)

  const isControlled = typeof value !== "undefined"
  const currentValue = isControlled ? (value as string) : internalValue

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" className={className} {...props}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error("TabsTrigger must be used within a Tabs")
  }

  const isActive = ctx.value === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={className}
      onClick={(e) => {
        props.onClick?.(e as any)
        ctx.setValue(value)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error("TabsContent must be used within a Tabs")
  }

  if (ctx.value !== value) return null

  return (
    <div role="tabpanel" {...props}>
      {children}
    </div>
  )
}

export default Tabs
