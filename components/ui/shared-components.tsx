"use client"

import React from "react"

export function PrimaryButton(props: JSX.IntrinsicElements["button"]) {
  return (
    <button
      {...props}
      className={[
        "px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-neutral-900",
        "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
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
        "px-4 py-2 text-sm bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100",
        "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
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