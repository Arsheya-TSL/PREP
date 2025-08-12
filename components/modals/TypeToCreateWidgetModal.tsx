import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Sparkles, Wand2, RefreshCw, Plus, X, AlertCircle, CheckCircle } from 'lucide-react'
import { parseWidgetIntent, validateWidgetDefinition } from '../../lib/widgetParser'
import { generateMockData } from '../../lib/mockDataGenerator'
import WidgetPreview from '../widgets/WidgetPreview'
import { WidgetDefinition, ParsedWidgetIntent } from '../../lib/types'
import { parseUtilityIntent, handleClarification } from '../../lib/utilityParser'
import { UtilityWidgetDef } from '../../lib/utilityTypes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import WorldClockWidget from '../widgets/WorldClockWidget'
import WeatherWidget from '../widgets/WeatherWidget'

interface TypeToCreateWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertWidget: (definition: WidgetDefinition) => void
  onInsertUtilityWidget?: (definition: UtilityWidgetDef) => void
}

const EXAMPLE_PROMPTS = [
  // Data prompts (original AI widget generator)
  "Show ITTs due in the next 14 days by region as a bar chart",
  "Display project progress by status as a pie chart",
  "Show budget vs actual spending over time as a line chart",
  "List top 5 suppliers by contract value as a table",
  
  // Utility prompts (clock and weather)
  "time for london + sydney plz",
  "weather in stockholm today",
  "add clock widget 4 cities",
  "show temps UK & Spain next 3 days"
]

export default function TypeToCreateWidgetModal({ isOpen, onClose, onInsertWidget, onInsertUtilityWidget }: TypeToCreateWidgetModalProps) {
  console.log('🎭 TypeToCreateWidgetModal render - isOpen:', isOpen)
  
  const [prompt, setPrompt] = useState('')
  const [parsedIntent, setParsedIntent] = useState<ParsedWidgetIntent | null>(null)
  const [currentDefinition, setCurrentDefinition] = useState<WidgetDefinition | null>(null)
  const [currentUtilityDefinition, setCurrentUtilityDefinition] = useState<UtilityWidgetDef | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [clarification, setClarification] = useState<string | null>(null)

  // Parse intent when prompt changes
  useEffect(() => {
    if (prompt.trim()) {
      console.log('🔍 Parsing prompt:', prompt);
      
      // Try utility parser first
      const utilityResult = parseUtilityIntent(prompt)
      console.log('🔧 Utility parser result:', utilityResult);
      
      if (utilityResult.success && utilityResult.definition) {
        console.log('✅ Using utility widget:', utilityResult.definition);
        setCurrentUtilityDefinition(utilityResult.definition)
        setCurrentDefinition(null)
        setValidationErrors([])
        setClarification(null)
      } else if (utilityResult.clarification) {
        console.log('❓ Utility parser needs clarification:', utilityResult.clarification);
        setClarification(utilityResult.clarification)
        setCurrentUtilityDefinition(null)
        setCurrentDefinition(null)
        setValidationErrors([])
      } else {
        // Fall back to original widget parser
        console.log('🔄 Falling back to data widget parser');
        const result = parseWidgetIntent(prompt)
        console.log('📊 Data widget parser result:', result);
        setParsedIntent(result)
        
        if (result.success && result.definition) {
          console.log('✅ Using data widget:', result.definition);
          setCurrentDefinition(result.definition)
          setCurrentUtilityDefinition(null)
          const validation = validateWidgetDefinition(result.definition)
          setValidationErrors(validation.errors)
        } else {
          console.log('❌ No valid widget found');
          setCurrentDefinition(null)
          setCurrentUtilityDefinition(null)
          setValidationErrors([])
        }
        setClarification(null)
      }
    } else {
      setParsedIntent(null)
      setCurrentDefinition(null)
      setCurrentUtilityDefinition(null)
      setValidationErrors([])
      setClarification(null)
    }
  }, [prompt])

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // Simulate processing time
    setTimeout(() => {
      setIsGenerating(false)
    }, 500)
  }, [prompt])

  const handleExampleClick = useCallback((example: string) => {
    setPrompt(example)
  }, [])

  const handleInsertWidget = useCallback(() => {
    if (currentUtilityDefinition && onInsertUtilityWidget) {
      onInsertUtilityWidget(currentUtilityDefinition)
      onClose()
    } else if (currentDefinition) {
      onInsertWidget(currentDefinition)
      onClose()
    }
  }, [currentUtilityDefinition, currentDefinition, onInsertUtilityWidget, onInsertWidget, onClose])

  const isValid = (currentDefinition && validationErrors.length === 0) || currentUtilityDefinition

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🎭 TypeToCreateWidgetModal onOpenChange:', open)
      if (!open) onClose()
    }}>
      <DialogContent className="w-[1400px] h-[900px] bg-white p-6 !max-w-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <Sparkles className="h-6 w-6 text-blue-600" />
            Type to Create Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-full mt-4">
          {/* Left Pane - Editor */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Natural Language Input */}
            <div className="space-y-4">
              <Label htmlFor="widget-prompt" className="text-base font-medium text-neutral-900">
                Describe the widget you want
              </Label>
              <Textarea
                id="widget-prompt"
                placeholder="e.g., Show ITTs due in the next 14 days by region as a bar chart"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[160px] text-base resize-none rounded-xl border border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
              
              {/* Example Prompts */}
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
                <Label className="text-sm font-medium text-neutral-700 mb-3 block">Try these examples:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      className="text-left p-3 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-sm"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Please fix these issues:</span>
                </div>
                <ul className="space-y-1 ml-6">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {isValid && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Widget definition is valid and ready to generate!</span>
              </div>
            )}
          </div>

          {/* Right Pane - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Live Preview</h3>
            </div>
            
                         <div className="flex-1 bg-neutral-50 rounded-xl border border-neutral-200 p-4 overflow-hidden">
               {currentUtilityDefinition ? (
                 <div className="h-full">
                   {currentUtilityDefinition.utilityType === 'world-clock' && (
                     <React.Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading...</div>}>
                       <WorldClockWidget 
                         config={currentUtilityDefinition.config as any} 
                         size={currentUtilityDefinition.size} 
                         className="h-full" 
                       />
                     </React.Suspense>
                   )}
                   {currentUtilityDefinition.utilityType === 'weather' && (
                     <React.Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading...</div>}>
                       <WeatherWidget 
                         config={currentUtilityDefinition.config as any} 
                         size={currentUtilityDefinition.size} 
                         className="h-full" 
                       />
                     </React.Suspense>
                   )}
                 </div>
               ) : currentDefinition ? (
                 <WidgetPreview 
                   definition={currentDefinition}
                   className="h-full"
                 />
               ) : clarification ? (
                 <div className="h-full flex items-center justify-center text-neutral-400">
                   <div className="text-center">
                     <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                     <p className="text-base">{clarification}</p>
                   </div>
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-neutral-400">
                   <div className="text-center">
                     <Wand2 className="h-12 w-12 mx-auto mb-4" />
                     <p className="text-base">Start typing to see a preview</p>
                   </div>
                 </div>
               )}
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
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="h-10 px-6"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            
            <Button
              onClick={handleInsertWidget}
              disabled={!isValid}
              className="h-10 px-6 bg-black text-white hover:bg-neutral-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Insert to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 