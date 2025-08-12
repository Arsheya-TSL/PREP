import React from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Sparkles, Settings, BarChart3, Wand2, X, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

interface WidgetChooserModalProps {
  isOpen: boolean
  onClose: () => void
  onChooseStandard: () => void
  onChooseTypeToCreate: () => void
}

const FEATURES = [
  "Step-by-step widget builder",
  "Advanced customization options", 
  "Template library",
  "Detailed configuration"
]

const AI_FEATURES = [
  "Natural language input",
  "Instant live preview",
  "Smart defaults",
  "Quick generation"
]

export default function WidgetChooserModal({ isOpen, onClose, onChooseStandard, onChooseTypeToCreate }: WidgetChooserModalProps) {
  console.log('🎭 WidgetChooserModal render - isOpen:', isOpen)
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🎭 WidgetChooserModal onOpenChange:', open)
      if (!open) onClose()
    }}>
      <DialogContent className="w-[1200px] h-[800px] bg-white p-6 !max-w-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <Sparkles className="h-6 w-6 text-blue-600" />
            Create Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 mt-4">
          {/* Two Option Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Standard Builder Card */}
            <div className="rounded-2xl border border-neutral-200 shadow-sm p-5 hover:bg-neutral-50 transition-colors cursor-pointer"
                 onClick={onChooseStandard}
                 role="button"
                 tabIndex={0}
                 onKeyDown={(e) => e.key === 'Enter' && onChooseStandard()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Standard Builder</h3>
                  <p className="text-sm text-neutral-500">Step-by-step configuration</p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-4">
                {FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Recommended for complex widgets
                </Badge>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </div>
            </div>

            {/* Type to Create Card */}
            <div className="rounded-2xl border border-neutral-200 shadow-sm p-5 hover:bg-neutral-50 transition-colors cursor-pointer"
                 onClick={onChooseTypeToCreate}
                 role="button"
                 tabIndex={0}
                 onKeyDown={(e) => e.key === 'Enter' && onChooseTypeToCreate()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Type to Create</h3>
                  <p className="text-sm text-neutral-500">AI-powered generation</p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-4">
                {AI_FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Perfect for quick widgets
                </Badge>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Examples Strip */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Try these examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button className="text-left p-3 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-sm">
                "Show ITT deadlines due next 14 days by region as a bar chart"
              </button>
              <button className="text-left p-3 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-sm">
                "Top 5 suppliers by on-time % in UK last quarter"
              </button>
              <button className="text-left p-3 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-sm">
                "Budget vs spend for active projects, monthly line chart"
              </button>
              <button className="text-left p-3 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-sm">
                "Count of defects by type this month, table format"
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onChooseStandard}
              className="h-10 px-6"
            >
              <Settings className="h-4 w-4 mr-2" />
              Standard Builder
            </Button>
            
            <Button
              onClick={onChooseTypeToCreate}
              className="h-10 px-6 bg-black text-white hover:bg-neutral-900"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Type to Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 