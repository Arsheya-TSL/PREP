import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { Separator } from "./separator"
import { CheckCircle, ArrowRight, Play, Users, BarChart3, Building2, FileText, Globe, Zap } from "lucide-react"

interface DemoStep {
  id: number
  title: string
  description: string
  action: string
  icon: React.ReactNode
  duration: string
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Welcome & Overview",
    description: "Introduce the PREP Construction Management System and its key capabilities",
    action: "Click 'Start Demo' to begin the automated showcase",
    icon: <Zap className="h-5 w-5 text-blue-600" />,
    duration: "30 seconds"
  },
  {
    id: 2,
    title: "Dashboard Customization",
    description: "Show how users can customize their dashboard layout and widgets",
    action: "Click 'Customize' button and toggle widgets on/off",
    icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
    duration: "45 seconds"
  },
  {
    id: 3,
    title: "Project Management",
    description: "Navigate to Projects page to show project tracking and management",
    action: "Click 'Projects' in sidebar and explore project cards",
    icon: <Building2 className="h-5 w-5 text-green-600" />,
    duration: "60 seconds"
  },
  {
    id: 4,
    title: "Supply Chain Management",
    description: "Demonstrate supplier management and comparison tools",
    action: "Go to 'Supply Chain' page and show supplier data",
    icon: <Users className="h-5 w-5 text-orange-600" />,
    duration: "45 seconds"
  },
  {
    id: 5,
    title: "ITT Manager",
    description: "Show Invitation to Tender management and workflow",
    action: "Navigate to 'ITT Manager' and demonstrate ITT creation",
    icon: <FileText className="h-5 w-5 text-red-600" />,
    duration: "60 seconds"
  },
  {
    id: 6,
    title: "Global Overview",
    description: "Show the world map and global project distribution",
    action: "Point out the world map showing project locations",
    icon: <Globe className="h-5 w-5 text-indigo-600" />,
    duration: "30 seconds"
  }
]

interface DemoGuideProps {
  isOpen: boolean
  onClose: () => void
  onStartDemo: () => void
}

export function DemoGuide({ isOpen, onClose, onStartDemo }: DemoGuideProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">PREP Construction Management System</CardTitle>
              <CardDescription className="text-blue-100">
                Demo Guide - Showcase the complete construction management platform
              </CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={onClose} className="bg-white/20 hover:bg-white/30">
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demo Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Demo Steps
              </h3>
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{step.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon}
                        <h4 className="font-medium text-sm">{step.title}</h4>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {step.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Key Features to Highlight
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Real-time Dashboard</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Customizable widgets and layouts</li>
                    <li>• Live project status updates</li>
                    <li>• Interactive charts and analytics</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Project Management</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Global project tracking</li>
                    <li>• Budget vs. spend monitoring</li>
                    <li>• Risk assessment and alerts</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Supply Chain</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Supplier performance tracking</li>
                    <li>• Material availability monitoring</li>
                    <li>• Cost comparison tools</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">ITT Management</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Automated tender creation</li>
                    <li>• Supplier response tracking</li>
                    <li>• Deadline management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Demo Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              💡 Demo Tips
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use the automated demo mode for a smooth presentation</li>
              <li>• Highlight the responsive design on different screen sizes</li>
              <li>• Show the drag-and-drop widget customization</li>
              <li>• Demonstrate the real-time data updates and charts</li>
              <li>• Emphasize the global project management capabilities</li>
            </ul>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={onStartDemo} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Play className="h-4 w-4 mr-2" />
              Start Automated Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
