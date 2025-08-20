"use client"

import React from "react"

export function PrimaryButton(props: JSX.IntrinsicElements["button"]) {
  return (
    <button
      {...props}
      className={[
        // Use design-system variables and smooth transitions
        "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground",
        "hover:bg-primary/90 transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        props.className || "",
      ].join(" ")}
    />
  )
}

export function GhostButton(props: JSX.IntrinsicElements["button"]) {
  return (
    <button
      {...props}
      className={[
        // Outline style that works in light/dark
        "px-4 py-2 text-sm rounded-lg border bg-background text-foreground",
        "border-border hover:bg-accent hover:text-accent-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        props.className || "",
      ].join(" ")}
    />
  )
}

export type WidgetSize = "sm" | "md" | "lg" | "xl"

export interface WidgetConfig {
  id: string
  title: string
  area: string
  size: WidgetSize
  enabled: boolean
  order: number
  description?: string
  type?: string
  category?: string
  pages?: string[]
}