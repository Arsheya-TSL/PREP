"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "./button"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <Button
      variant="ghost"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-11 px-3 rounded-xl hover:bg-accent flex items-center gap-2"
      title={isDark ? "Light" : "Dark"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="text-sm text-muted-foreground hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </Button>
  )
}

