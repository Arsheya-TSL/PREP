import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog'
import { cn } from './utils'

interface DialogWideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export function DialogWide({ open, onOpenChange, children, className, title, description }: DialogWideProps) {
  console.log('🎭 DialogWide render - open:', open)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "relative w-[92vw] max-w-[1160px] h-[72vh] min-h-[640px] max-h-[780px]",
          "bg-white rounded-2xl shadow-2xl ring-1 ring-neutral-200",
          "overflow-hidden flex flex-col",
          "sm:w-[96vw] sm:max-w-[720px] sm:h-[78vh] sm:min-h-[560px]",
          className
        )}
        style={{ zIndex: 9999 }}
      >
        {/* Hidden title and description for accessibility */}
        {title && <DialogTitle className="sr-only">{title}</DialogTitle>}
        {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
        
        {children}
      </DialogContent>
    </Dialog>
  )
}

interface DialogWideHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogWideHeader({ children, className }: DialogWideHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-6 md:px-8 py-4 border-b border-neutral-200",
      className
    )}>
      {children}
    </div>
  )
}

interface DialogWideBodyProps {
  children: React.ReactNode
  className?: string
}

export function DialogWideBody({ children, className }: DialogWideBodyProps) {
  return (
    <div className={cn(
      "flex-1 grid grid-cols-12 gap-6 md:gap-8 px-6 md:px-8 py-6 overflow-hidden",
      className
    )}>
      {children}
    </div>
  )
}

interface DialogWidePaneProps {
  children: React.ReactNode
  className?: string
  side?: 'left' | 'right'
}

export function DialogWidePane({ children, className, side = 'left' }: DialogWidePaneProps) {
  const baseClasses = "min-w-0"
  const responsiveClasses = side === 'left' 
    ? "col-span-12 lg:col-span-7 xl:col-span-7 overflow-y-auto pr-1"
    : "col-span-12 lg:col-span-5 xl:col-span-5"

  return (
    <div className={cn(baseClasses, responsiveClasses, className)}>
      {children}
    </div>
  )
}

interface DialogWidePreviewProps {
  children: React.ReactNode
  className?: string
}

export function DialogWidePreview({ children, className }: DialogWidePreviewProps) {
  return (
    <div className={cn(
      "sticky top-0 self-start h-full min-h-[480px] rounded-xl bg-neutral-50 border border-neutral-200 p-4 overflow-hidden",
      className
    )}>
      {children}
    </div>
  )
}

interface DialogWideFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogWideFooter({ children, className }: DialogWideFooterProps) {
  return (
    <div className={cn(
      "sticky bottom-0 mt-auto px-6 md:px-8 py-4",
      "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
      "border-t border-neutral-200",
      className
    )}>
      {children}
    </div>
  )
} 