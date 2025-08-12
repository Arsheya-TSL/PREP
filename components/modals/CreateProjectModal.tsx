import { useState } from "react"
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  X
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { ProjectFormData } from "../../lib/types"
import { supplierPerformanceData } from "../../lib/constants"
import { validateRequired, validateNumber, validateDate, formatLargeCurrency } from "../../lib/utils"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectFormData: ProjectFormData
  setProjectFormData: (data: ProjectFormData | ((prev: ProjectFormData) => ProjectFormData)) => void
  onCreateProject: () => void
  onAutoGenerateITT?: (projectData: ProjectFormData) => void
}

const TRADE_CATEGORIES = [
  "Structural", "Electrical", "HVAC", "Interior", "Medical", 
  "Landscaping", "Plumbing", "Technology", "Security", "General"
]

const MATERIALS_REQUIRED = [
  "Steel", "Concrete", "Cables", "Rebar", "Switches", "Lighting",
  "AC Units", "Ventilation", "Heating", "Pipes", "Fittings", 
  "Boilers", "Glass", "Insulation"
]

const COMPLIANCE_REQUIREMENTS = [
  "ISO 9001", "NICEIC", "Gas Safe", "CHAS", "Constructionline", 
  "CE Mark", "TÜV", "VCA", "BSI", "LEED", "BREEAM"
]

const TEAM_MEMBERS = [
  { id: "pm", name: "John Doe", role: "Project Manager", avatar: "JD" },
  { id: "arch", name: "Jane Smith", role: "Architect", avatar: "JS" },
  { id: "eng", name: "Bob Wilson", role: "Engineer", avatar: "BW" },
  { id: "proc", name: "Sarah Davis", role: "Procurement", avatar: "SD" },
  { id: "fin", name: "Mike Johnson", role: "Finance", avatar: "MJ" },
  { id: "qa", name: "Lisa Chen", role: "Quality Assurance", avatar: "LC" }
]

export default function CreateProjectModal({
  open,
  onOpenChange,
  projectFormData,
  setProjectFormData,
  onCreateProject,
  onAutoGenerateITT
}: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestedSuppliers, setSuggestedSuppliers] = useState<typeof supplierPerformanceData>([])

  const totalSteps = 4

  // Auto-suggest suppliers based on project data
  const generateSupplierSuggestions = () => {
    const suggestions = supplierPerformanceData.filter(supplier => {
      // Match by materials
      const materialMatch = projectFormData.materials.some(material => 
        supplier.materialsAvailable.includes(material)
      )
      
      // Match by trade categories
      const categoryMatch = projectFormData.tradeCategories.some(category =>
        supplier.category === category || supplier.category === 'General'
      )
      
      // Match by region
      const regionMatch = supplier.region === projectFormData.country

      return (materialMatch || categoryMatch) && supplier.approved
    }).sort((a, b) => {
      // Prioritize by score and region match
      const aRegionBonus = a.region === projectFormData.country ? 10 : 0
      const bRegionBonus = b.region === projectFormData.country ? 10 : 0
      
      return (b.score + bRegionBonus) - (a.score + aRegionBonus)
    })

    setSuggestedSuppliers(suggestions.slice(0, 8))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!validateRequired(projectFormData.name)) newErrors.name = "Project name is required"
        if (!validateRequired(projectFormData.location)) newErrors.location = "Location is required"
        if (!validateRequired(projectFormData.country)) newErrors.country = "Country is required"
        if (!validateDate(projectFormData.startDate)) newErrors.startDate = "Valid start date is required"
        if (!validateDate(projectFormData.endDate)) newErrors.endDate = "Valid end date is required"
        if (new Date(projectFormData.startDate) >= new Date(projectFormData.endDate)) {
          newErrors.endDate = "End date must be after start date"
        }
        break
      
      case 2:
        if (!validateNumber(projectFormData.budget, 1000)) newErrors.budget = "Budget must be at least £1,000"
        if (!validateRequired(projectFormData.size)) newErrors.size = "Project size is required"
        if (!validateRequired(projectFormData.template)) newErrors.template = "Template selection is required"
        break
        
      case 3:
        if (projectFormData.tradeCategories.length === 0) newErrors.tradeCategories = "Select at least one trade category"
        if (projectFormData.materials.length === 0) newErrors.materials = "Select at least one material"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateSupplierSuggestions()
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFinish = () => {
    if (validateStep(currentStep)) {
      onCreateProject()
      
      // Auto-generate ITT if requested
      if (projectFormData.autoGenerateITT && onAutoGenerateITT) {
        onAutoGenerateITT(projectFormData)
      }
      
      // Reset form
      setProjectFormData({
        name: "",
        location: "",
        country: "",
        startDate: "",
        endDate: "",
        description: "",
        budget: "",
        size: "",
        template: "",
        materials: [],
        tradeCategories: [],
        specialRequirements: "",
        compliance: [],
        team: [],
        autoGenerateITT: false,
        createTeamsChannel: false,
        setupFolders: false
      })
      setCurrentStep(1)
      setErrors({})
    }
  }

  const toggleArrayItem = <T extends string>(array: T[], item: T, setter: (array: T[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (step === currentStep) return <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{step}</div>
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground">{step}</div>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px] h-[700px] max-w-none p-8 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              Create New Project
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Set up a comprehensive construction project with automated ITT generation and supplier matching
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar - 4 Steps */}
        <div className="flex items-center justify-center mb-8 flex-shrink-0">
          <div className="flex items-center w-full max-w-2xl">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center justify-center">
                    {getStepIcon(step)}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${step === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Budget & Size'}
                    {step === 3 && 'Requirements'}
                    {step === 4 && 'Team & Setup'}
                  </span>
                </div>
                {step < totalSteps && (
                  <div className={`h-0.5 flex-1 mx-4 ${step < currentStep ? 'bg-green-600' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-1">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter project name"
                        value={projectFormData.name}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="City, Address"
                        value={projectFormData.location}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, location: e.target.value }))}
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country/Region *</Label>
                      <Select 
                        value={projectFormData.country} 
                        onValueChange={(value) => setProjectFormData(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="USA">United States</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={projectFormData.startDate}
                          onChange={(e) => setProjectFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className={errors.startDate ? "border-red-500" : ""}
                        />
                        {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Expected Completion *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={projectFormData.endDate}
                          onChange={(e) => setProjectFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className={errors.endDate ? "border-red-500" : ""}
                        />
                        {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the project scope and objectives..."
                        value={projectFormData.description}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Size */}
          {currentStep === 2 && (
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Financial Planning</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Total Budget (£) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g. 2500000"
                        value={projectFormData.budget}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className={errors.budget ? "border-red-500" : ""}
                      />
                      {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
                      {projectFormData.budget && (
                        <p className="text-sm text-muted-foreground">
                          Budget: {formatLargeCurrency(parseInt(projectFormData.budget))}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="size">Project Size *</Label>
                      <Select 
                        value={projectFormData.size} 
                        onValueChange={(value) => setProjectFormData(prev => ({ ...prev, size: value }))}
                      >
                        <SelectTrigger className={errors.size ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select project size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (under £500K)</SelectItem>
                          <SelectItem value="medium">Medium (£500K - £2M)</SelectItem>
                          <SelectItem value="large">Large (£2M - £5M)</SelectItem>
                          <SelectItem value="extra-large">Extra Large (over £5M)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.size && <p className="text-sm text-red-600">{errors.size}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Project Structure</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Folder Structure Template *</Label>
                      <Select 
                        value={projectFormData.template} 
                        onValueChange={(value) => setProjectFormData(prev => ({ ...prev, template: value }))}
                      >
                        <SelectTrigger className={errors.template ? "border-red-500" : ""}>
                          <SelectValue placeholder="Choose template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office Building</SelectItem>
                          <SelectItem value="residential">Residential Complex</SelectItem>
                          <SelectItem value="hospital">Healthcare Facility</SelectItem>
                          <SelectItem value="industrial">Industrial Building</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure Project</SelectItem>
                          <SelectItem value="retail">Retail/Commercial</SelectItem>
                          <SelectItem value="custom">Custom Structure</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.template && <p className="text-sm text-red-600">{errors.template}</p>}
                    </div>

                    <Card className="bg-blue-50/50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Template Benefits</span>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Pre-configured folder structure</li>
                          <li>• Industry-specific document templates</li>
                          <li>• Automated compliance checklists</li>
                          <li>• Role-based access permissions</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements - THREE EQUAL COLUMNS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Three Equal Columns Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Trade Categories */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Trade Categories</h3>
                    <Badge variant="outline" className="text-xs">Required *</Badge>
                  </div>
                  <div className="min-h-[300px] p-4 border rounded-lg bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-2">
                      {TRADE_CATEGORIES.map(category => (
                        <div key={category} className="flex items-center space-x-2 p-2">
                          <Checkbox
                            id={`trade-${category}`}
                            checked={projectFormData.tradeCategories.includes(category)}
                            onCheckedChange={() => toggleArrayItem(
                              projectFormData.tradeCategories, 
                              category, 
                              (arr) => setProjectFormData(prev => ({ ...prev, tradeCategories: arr }))
                            )}
                          />
                          <Label htmlFor={`trade-${category}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.tradeCategories && <p className="text-sm text-red-600">{errors.tradeCategories}</p>}
                </div>

                {/* Column 2: Materials Required */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Materials Required</h3>
                    <Badge variant="outline" className="text-xs">Required *</Badge>
                  </div>
                  <div className="min-h-[300px] p-4 border rounded-lg bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-2">
                      {MATERIALS_REQUIRED.map(material => (
                        <div key={material} className="flex items-center space-x-2 p-2">
                          <Checkbox
                            id={`material-${material}`}
                            checked={projectFormData.materials.includes(material)}
                            onCheckedChange={() => toggleArrayItem(
                              projectFormData.materials, 
                              material, 
                              (arr) => setProjectFormData(prev => ({ ...prev, materials: arr }))
                            )}
                          />
                          <Label htmlFor={`material-${material}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.materials && <p className="text-sm text-red-600">{errors.materials}</p>}
                </div>

                {/* Column 3: Compliance Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Compliance Requirements</h3>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <div className="min-h-[300px] p-4 border rounded-lg bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-2">
                      {COMPLIANCE_REQUIREMENTS.map(compliance => (
                        <div key={compliance} className="flex items-center space-x-2 p-2">
                          <Checkbox
                            id={`compliance-${compliance}`}
                            checked={projectFormData.compliance.includes(compliance)}
                            onCheckedChange={() => toggleArrayItem(
                              projectFormData.compliance, 
                              compliance, 
                              (arr) => setProjectFormData(prev => ({ ...prev, compliance: arr }))
                            )}
                          />
                          <Label htmlFor={`compliance-${compliance}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {compliance}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Special Requirements Textarea */}
              <div className="space-y-2">
                <Label htmlFor="specialRequirements" className="text-lg font-semibold">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Any special requirements, constraints, or notes for this project..."
                  value={projectFormData.specialRequirements}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  className="resize-none min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Team & Setup */}
          {currentStep === 4 && (
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Team Assignment</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {TEAM_MEMBERS.map(member => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                        <Checkbox
                          id={`team-${member.id}`}
                          checked={projectFormData.team.includes(member.id)}
                          onCheckedChange={() => toggleArrayItem(
                            projectFormData.team, 
                            member.id, 
                            (arr) => setProjectFormData(prev => ({ ...prev, team: arr }))
                          )}
                        />
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`team-${member.id}`} className="text-sm font-medium">{member.name}</Label>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="text-base font-semibold text-foreground">Automation Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id="autoGenerateITT"
                          checked={projectFormData.autoGenerateITT}
                          onCheckedChange={(checked) => setProjectFormData(prev => ({ ...prev, autoGenerateITT: !!checked }))}
                        />
                        <div className="flex-1">
                          <Label htmlFor="autoGenerateITT" className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Auto-generate ITT from project data
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Automatically create ITT templates with your project requirements
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id="createTeamsChannel"
                          checked={projectFormData.createTeamsChannel}
                          onCheckedChange={(checked) => setProjectFormData(prev => ({ ...prev, createTeamsChannel: !!checked }))}
                        />
                        <div className="flex-1">
                          <Label htmlFor="createTeamsChannel" className="text-sm font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-green-600" />
                            Create Microsoft Teams channel
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Set up dedicated Teams channel for project communication
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id="setupFolders"
                          checked={projectFormData.setupFolders}
                          onCheckedChange={(checked) => setProjectFormData(prev => ({ ...prev, setupFolders: !!checked }))}
                        />
                        <div className="flex-1">
                          <Label htmlFor="setupFolders" className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-600" />
                            Set up SharePoint folder structure
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Create organized folder structure based on selected template
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Supplier Suggestions</h3>
                  
                  {/* Suggested Suppliers */}
                  {suggestedSuppliers.length > 0 ? (
                    <Card className="bg-blue-50/50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          Recommended Suppliers
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Based on your materials and trade categories
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-64 overflow-y-auto">
                        <div className="space-y-3">
                          {suggestedSuppliers.slice(0, 6).map(supplier => (
                            <div key={supplier.name} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-foreground">{supplier.name}</h4>
                                <p className="text-xs text-muted-foreground">{supplier.category} • {supplier.region}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-700">{supplier.onTimeDelivery}% on-time</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    £{supplier.costPerUnit}/unit
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                                <span className="text-sm font-medium">{supplier.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gray-50 border-dashed border-gray-300">
                      <CardContent className="py-8 text-center">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Supplier suggestions will appear based on your trade categories and materials
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex items-center justify-between pt-6 flex-shrink-0 border-t">
          <div className="flex items-center gap-3">
            <Progress value={(currentStep / totalSteps) * 100} className="w-32" />
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}