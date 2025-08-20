"use client";
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  countryName: string
  countryData?: any
}

export default function CountryModal({ isOpen, onClose, countryName, countryData }: CountryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="w-[600px] max-h-[500px] bg-background/80 backdrop-blur-md border border-border">
        <DialogHeader className="border-b border-border bg-card/50 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {countryName}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Country Information</h3>
            <p className="text-gray-600">
              Information about {countryName} will be displayed here.
            </p>
            {countryData && (
              <div className="mt-3 text-sm text-gray-500">
                <pre className="whitespace-pre-wrap">{JSON.stringify(countryData, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onClose}>
              View Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 