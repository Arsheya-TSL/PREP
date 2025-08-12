import { useDrag, useDrop } from 'react-dnd'
import { GripVertical, Maximize2, Minimize2 } from "lucide-react"
import { Widget, DragItem, WidgetSize } from "../../lib/types"
import { getGridSpan, getWidgetHeight, getTransitionClasses, snapToGrid } from "../../lib/utils"
import { WIDGET_ITEM_TYPE } from "../../lib/constants"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface DraggableWidgetProps {
  widget: Widget
  index: number
  children: React.ReactNode
  moveWidget: (dragIndex: number, dropIndex: number) => void
  customizeMode: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  onSizeChange?: (widgetId: string, size: WidgetSize) => void
}

export default function DraggableWidget({ 
  widget, 
  index, 
  children, 
  moveWidget, 
  customizeMode, 
  screenSize,
  onSizeChange 
}: DraggableWidgetProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: WIDGET_ITEM_TYPE,
    item: { id: widget.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: customizeMode,
  })

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: WIDGET_ITEM_TYPE,
    drop: (draggedItem: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (delta) {
          const snapped = snapToGrid(delta.x, delta.y, 8)
          // Handle grid snapping logic here
        }
      }
    },
    hover: (draggedItem: DragItem, monitor) => {
      if (draggedItem.index !== index) {
        moveWidget(draggedItem.index, index)
        draggedItem.index = index
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
  })

  const handleSizeChange = (newSize: WidgetSize) => {
    if (onSizeChange) {
      onSizeChange(widget.id, newSize)
    }
  }

  const getSizeOptions = () => {
    if (screenSize === 'mobile') {
      return [{ value: 'medium', label: 'Standard' }]
    }
    
    return [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'extra-large', label: 'Extra Large' }
    ]
  }

  return (
    <div
      ref={(node) => {
        if (customizeMode) {
          dragPreview(drop(node))
        } else {
          drop(node)
        }
      }}
      className={`
        ${getGridSpan(widget.size, screenSize)} 
        ${getTransitionClasses()}
        ${isDragging ? 'opacity-30 scale-95 z-50' : 'z-10'}
        ${isOver && canDrop ? 'ring-2 ring-primary/50 ring-offset-2' : ''}
        ${customizeMode ? 'cursor-move' : ''}
        group relative pointer-events-auto
      `}
    >
      <div 
        className={`
          relative 
          ${getWidgetHeight(widget.size, true)} 
          ${customizeMode ? 'ring-1 ring-primary/20 ring-offset-1 rounded-xl bg-primary/5' : ''}
          ${getTransitionClasses()}
        `}
      >
        {/* Customize Mode Controls */}
        {customizeMode && (
          <>
            {/* Drag Handle */}
            <div 
              ref={drag}
              className="absolute top-2 left-2 z-30 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-border cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Size Control */}
            <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Select
                value={widget.size}
                onValueChange={handleSizeChange}
                disabled={screenSize === 'mobile'}
              >
                <SelectTrigger className="w-24 h-7 text-xs bg-white/90 backdrop-blur-sm border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getSizeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Resize Buttons */}
            <div className="absolute bottom-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {widget.size !== 'small' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm border-border"
                  onClick={() => handleSizeChange('small')}
                  disabled={screenSize === 'mobile'}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}
              {widget.size !== 'extra-large' && screenSize === 'desktop' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm border-border"
                  onClick={() => handleSizeChange('extra-large')}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Widget Info Badge */}
            <div className="absolute bottom-2 left-2 z-30 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {widget.title}
            </div>
          </>
        )}

        {/* Widget Content */}
        <div className={`h-full ${customizeMode ? 'pointer-events-none' : 'pointer-events-auto'} relative z-10`}>
          {children}
        </div>

        {/* Drop Zone Indicator */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/50 rounded-xl z-10 flex items-center justify-center">
            <div className="bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
              Drop Here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}