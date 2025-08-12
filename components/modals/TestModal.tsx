import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  console.log('🎭 TestModal render - isOpen:', isOpen)
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🎭 TestModal onOpenChange:', open)
      if (!open) onClose()
    }}>
      <DialogContent className="w-[500px] h-[300px] bg-white">
        <DialogHeader>
          <DialogTitle>Test Modal</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is a test modal to see if the Dialog component works.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 