import { useEffect, useRef, useState } from "react"
import { Plus, BarChart3, FileText } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ProjectFormData, TenderDraft } from "../../lib/types"
import { projects, regionData } from "../../lib/constants"
import WorldMap from "../WorldMap"

interface ProjectsPageProps {
  comparisonProjects: number[]
  setShowComparison: (show: boolean) => void
  showCreateProject: boolean
  setShowCreateProject: (show: boolean) => void
  createProjectStep: number
  setCreateProjectStep: (step: number) => void
  projectFormData: ProjectFormData
  setProjectFormData: (data: ProjectFormData) => void
  handleCreateProject: () => void
  // Added for tender flow and cards
  userProjects?: Array<{ id: number; name: string; country: string; startDate?: string; endDate?: string; description?: string; sizeBucket?: string }>
  addProject?: (project: any) => void
  addITT?: (itt: any) => void
  addHighlightedCountry?: (country: string) => void
  setActiveTab?: (tab: string) => void
  setShowCreateITT?: (show: boolean) => void
  setIttFormData?: (data: any) => void
  tenderDrafts?: TenderDraft[]
  saveTenderDraft?: (draft: Omit<TenderDraft, 'id' | 'savedAt'>) => TenderDraft
  updateTenderDraft?: (id: number, updater: (prev: TenderDraft) => TenderDraft) => void
  removeTenderDraft?: (id: number) => void
}

export default function ProjectsPage({
  comparisonProjects,
  setShowComparison,
  showCreateProject,
  setShowCreateProject,
  createProjectStep,
  setCreateProjectStep,
  projectFormData,
  setProjectFormData,
  handleCreateProject,
  userProjects = [],
  addProject,
  addITT,
  addHighlightedCountry,
  setActiveTab,
  setShowCreateITT,
  setIttFormData,
  tenderDrafts = [],
  saveTenderDraft,
  updateTenderDraft,
  removeTenderDraft
}: ProjectsPageProps) {
  // Tender modal local state
  const [tenderStep, setTenderStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [openCreateTender, setOpenCreateTender] = useState(false)
  const [createITTNow, setCreateITTNow] = useState(false)
  const [newMaterial, setNewMaterial] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  // Comprehensive list of all countries
  const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
  ]

  // Filter countries based on search
  const filteredCountries = allCountries.filter(country => 
    country.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 10) // Limit to 10 results for performance

    // Simple country info display instead of buggy globe
  const getCountryInfo = (country: string) => {
    const countryData: { [key: string]: { flag: string; region: string; emoji: string } } = {
      "United States": { flag: "🇺🇸", region: "North America", emoji: "🏢" },
      "United Kingdom": { flag: "🇬🇧", region: "Europe", emoji: "🏰" },
      "Germany": { flag: "🇩🇪", region: "Europe", emoji: "🏭" },
      "France": { flag: "🇫🇷", region: "Europe", emoji: "🗼" },
      "Canada": { flag: "🇨🇦", region: "North America", emoji: "🍁" },
      "Australia": { flag: "🇦🇺", region: "Oceania", emoji: "🦘" },
      "Japan": { flag: "🇯🇵", region: "Asia", emoji: "🏯" },
      "China": { flag: "🇨🇳", region: "Asia", emoji: "🏮" },
      "India": { flag: "🇮🇳", region: "Asia", emoji: "🕌" },
      "Brazil": { flag: "🇧🇷", region: "South America", emoji: "🌴" },
      "Netherlands": { flag: "🇳🇱", region: "Europe", emoji: "🌷" },
      "Spain": { flag: "🇪🇸", region: "Europe", emoji: "🏛️" },
      "Italy": { flag: "🇮🇹", region: "Europe", emoji: "🍝" },
      "Switzerland": { flag: "🇨🇭", region: "Europe", emoji: "🏔️" },
      "Singapore": { flag: "🇸🇬", region: "Asia", emoji: "🏙️" },
      "United Arab Emirates": { flag: "🇦🇪", region: "Middle East", emoji: "🏗️" },
      "South Korea": { flag: "🇰🇷", region: "Asia", emoji: "🏢" },
      "Mexico": { flag: "🇲🇽", region: "North America", emoji: "🌮" },
      "Norway": { flag: "🇳🇴", region: "Europe", emoji: "⛰️" },
      "Sweden": { flag: "🇸🇪", region: "Europe", emoji: "🌲" },
    }
    
    return countryData[country] || { 
      flag: "🌍", 
      region: "Global", 
      emoji: "🏗️" 
    }
  }

  const handleCreateTender = () => {
    // Create the project/tender
    addProject && addProject({ 
      name: projectFormData.name || 'New Tender', 
      country: selectedCountry, 
      startDate: projectFormData.startDate, 
      endDate: projectFormData.endDate, 
      description: projectFormData.description, 
      sizeBucket: projectFormData.size 
    })
    
    // Add highlighted country for map
    if (selectedCountry) addHighlightedCountry && addHighlightedCountry(selectedCountry)
    
    // Automatically create an ITT entry for this tender
    if (addITT) {
      const newITT = {
        id: Date.now(),
        project: projectFormData.name || 'New Tender',
        category: 'General Construction',
        status: 'Draft',
        created: new Date().toISOString().split('T')[0],
        deadline: projectFormData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        suppliers: [],
        responses: 0,
        budget: parseInt(projectFormData.budget?.replace(/[^\d]/g, '') || '0') || 50000,
        region: selectedCountry || projectFormData.country || 'Global'
      }
      addITT(newITT)
    }
    
    // Pre-fill ITT form data for potential additional ITT creation
    setIttFormData && setIttFormData((prev: any) => ({
      ...prev,
      project: projectFormData.name,
      region: (selectedCountry || projectFormData.country || '').toLowerCase(),
      materials: projectFormData.materials || [],
      compliance: projectFormData.compliance || [],
      specialRequirements: projectFormData.specialRequirements || ''
    }))
    
    // Navigate to ITT Manager and optionally open the create ITT modal
    setActiveTab && setActiveTab('itt-manager')
    if (createITTNow) {
      setShowCreateITT && setShowCreateITT(true)
    }
    
    // Close modal and reset form
    setOpenCreateTender(false)
    setTenderStep(1)
    setSelectedCountry("")
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
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800">Projects</h1>
        <p className="text-neutral-500 mt-1">Comprehensive project management and analytics</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {comparisonProjects.length > 1 && (
          <Button
            variant="outline"
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-neutral-100 border-neutral-200"
          >
            <BarChart3 className="h-4 w-4" />
            Compare ({comparisonProjects.length})
          </Button>
        )}
        
        <Dialog open={openCreateTender} onOpenChange={setOpenCreateTender}>
          <DialogTrigger asChild>
            <Button className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpenCreateTender(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Tender
            </Button>
          </DialogTrigger>
          
          <DialogContent className="w-[60vw] max-w-4xl h-[75vh] !max-w-none bg-gradient-to-br from-slate-50 to-blue-50" style={{ width: '60vw', maxWidth: '900px', zIndex: 50 }} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader className="border-b border-blue-200 pb-4 bg-white/80 backdrop-blur-sm rounded-t-lg">
              <div className="flex items-center justify-between">
                {/* Left Side - Title */}
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    🚀 Create New Tender
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-sm">Complete all steps to create your tender</DialogDescription>
                </div>
                
                {/* Right Side - Progress Stepper */}
                <div className="flex items-center gap-3">
                  {/* Mini Stepper */}
                  <div className="flex items-center gap-2">
                    {[1,2,3,4].map((step, index) => (
                      <div key={step} className="flex items-center">
                        <button
                          onClick={() => setTenderStep(step as 1|2|3|4)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                            step === tenderStep 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110' 
                              : step < tenderStep 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {step < tenderStep ? '✓' : step}
                        </button>
                        {index < 3 && (
                          <div className={`w-4 h-1 mx-1 rounded-full transition-all duration-500 ${step < tenderStep ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-right">
                    <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.round((tenderStep/4)*100)}%
                    </span>
                    <div className="text-xs text-slate-500 font-medium">complete</div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Form Content */}
            <div className="flex-1 py-4">
              <div className="flex gap-6">
                {/* Left Side - Form */}
              <div className="flex-1 space-y-4">
                {tenderStep === 1 && (
                    <div className="space-y-3">
                      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                          📋 Project Details
                        </h3>
                        <p className="text-slate-600 text-xs">Essential project information (2x2 grid)</p>
                      </div>
                      
                                            {/* Compact 2x2 Grid - Better Readability */}
                      <div className="max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                          {/* Row 1: Country & Project Name */}
                  <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              🌍 Country <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                value={selectedCountry || countrySearch}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setCountrySearch(value)
                                  setShowCountryDropdown(true)
                                  if (!value) {
                                    setSelectedCountry("")
                                    setProjectFormData({ ...projectFormData, country: "" })
                                  }
                                }}
                                onFocus={() => {
                                  if (!selectedCountry) {
                                    setShowCountryDropdown(true)
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(() => setShowCountryDropdown(false), 200)
                                }}
                                className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm"
                                placeholder="🔍 Search..."
                              />
                              
                              {/* Country Dropdown */}
                              {showCountryDropdown && !selectedCountry && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                      <button
                                        key={country}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 text-sm"
                                        onClick={() => {
                                          setSelectedCountry(country)
                                          setProjectFormData({ ...projectFormData, country })
                                          setCountrySearch("")
                                          setShowCountryDropdown(false)
                                        }}
                                      >
                                        🌍 {country}
                                      </button>
                                    ))
                                  ) : countrySearch ? (
                                    <div className="px-3 py-2 text-slate-500 text-sm">
                                      No countries found
                                    </div>
                                  ) : (
                                    <div className="px-3 py-2 text-slate-500 text-sm">
                                      Type to search...
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {selectedCountry && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry("")
                                      setProjectFormData({ ...projectFormData, country: "" })
                                      setCountrySearch("")
                                    }}
                                    className="text-slate-400 hover:text-red-500 text-sm"
                                  >
                                    ❌
                                  </button>
                                </div>
                              )}
                            </div>
                  </div>
                          
                  <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              📝 Project Name <span className="text-red-500">*</span>
                            </label>
                            <Input 
                              className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm" 
                              value={projectFormData.name} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })} 
                              placeholder="Project name" 
                            />
                  </div>
                          
                          {/* Row 2: Start Date & End Date */}
                  <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              🗓️ Start Date
                            </label>
                            <Input 
                              className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm" 
                              type="date" 
                              value={projectFormData.startDate} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })} 
                            />
                  </div>
                          
                  <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              🏁 End Date
                            </label>
                            <Input 
                              className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm" 
                              type="date" 
                              value={projectFormData.endDate} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })} 
                            />
                          </div>
                        </div>
                        
                        {/* Description below the 2x2 grid */}
                        <div className="space-y-2 mt-4">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            💭 Project Description
                          </label>
                          <Textarea 
                            className="w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm min-h-[70px]" 
                            value={projectFormData.description} 
                            onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })} 
                            placeholder="Brief project description..." 
                          />
                  </div>
                  </div>
                </div>
                )}

                {tenderStep === 2 && (
                  <div className="space-y-4">
                      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                          💰 Scope & Budget
                        </h3>
                        <p className="text-slate-600 text-sm">Define the project scope and financial details</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              📏 Project Size
                            </label>
                            <select 
                              value={projectFormData.size} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, size: e.target.value })}
                              className="h-11 w-full border-2 border-slate-200 focus:border-emerald-400 bg-white rounded-lg shadow-sm hover:shadow-md transition-all px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
                            >
                              <option value="">🔽 Select project size</option>
                              <option value="0-500">📐 Small (0–500 m²)</option>
                              <option value="500-2000">🏢 Medium (500–2,000 m²)</option>
                              <option value="2000-10000">🏗️ Large (2,000–10,000 m²)</option>
                              <option value="10000-50000">🏭 Very Large (10,000–50,000 m²)</option>
                              <option value=">50000">🌆 Mega Project (50,000+ m²)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              💷 Estimated Budget
                            </label>
                            <Input 
                              className="h-11 border-2 border-slate-200 focus:border-emerald-400 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all" 
                              value={projectFormData.budget} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, budget: e.target.value })} 
                              placeholder="💰 e.g. £250,000" 
                            />
                          </div>
                        </div>
                        
                    <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            ⚡ Special Requirements
                          </label>
                          <Textarea 
                            className="border-2 border-slate-200 focus:border-emerald-400 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all min-h-[100px]" 
                            value={projectFormData.specialRequirements} 
                            onChange={(e) => setProjectFormData({ ...projectFormData, specialRequirements: e.target.value })} 
                            placeholder="📋 Any special requirements, compliance needs, or additional notes..." 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {tenderStep === 3 && (
                    <div className="space-y-4">
                      <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                          🔧 Materials & Compliance
                        </h3>
                        <p className="text-slate-600 text-sm">Specify materials and compliance requirements</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            🛠️ Required Materials
                          </label>
                          <div className="flex gap-3">
                            <Input 
                              className="h-11 border-2 border-slate-200 focus:border-orange-400 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex-1" 
                              value={newMaterial} 
                              onChange={(e) => setNewMaterial(e.target.value)} 
                              placeholder="🏗️ Enter material name" 
                              onKeyDown={(e) => { 
                                if (e.key === 'Enter' && newMaterial.trim()) { 
                                  setProjectFormData({ ...projectFormData, materials: [...projectFormData.materials, newMaterial.trim()] }); 
                                  setNewMaterial('') 
                                } 
                              }} 
                            />
                            <Button 
                              type="button" 
                              className="h-11 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-md hover:shadow-lg transition-all" 
                              onClick={() => { 
                                if (newMaterial.trim()) { 
                                  setProjectFormData({ ...projectFormData, materials: [...projectFormData.materials, newMaterial.trim()] }); 
                                  setNewMaterial('') 
                                } 
                              }}
                            >
                              ➕ Add
                            </Button>
                          </div>
                          
                          {projectFormData.materials.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                              {projectFormData.materials.map((m, idx) => (
                                <span key={idx} className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-orange-200 rounded-full text-sm shadow-sm">
                                  🔧 {m}
                                  <button 
                                    className="text-red-500 hover:text-red-700 font-bold transition-colors" 
                                    onClick={() => setProjectFormData({ ...projectFormData, materials: projectFormData.materials.filter((x) => x !== m) })}
                                  >
                                    ❌
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            ✅ Compliance Requirements
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['ISO 9001', 'NICEIC', 'CE Mark', 'CHAS'].map((req) => (
                              <label key={req} className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" 
                                  checked={projectFormData.compliance.includes(req)} 
                                  onChange={(e) => {
                                    const checked = e.target.checked
                                    setProjectFormData({
                                      ...projectFormData,
                                      compliance: checked ? [...projectFormData.compliance, req] : projectFormData.compliance.filter((r) => r !== req)
                                    })
                                  }} 
                                />
                                <span className="text-sm font-semibold text-slate-700">{req}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tenderStep === 4 && (
                    <div className="space-y-4">
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                          📝 Review & Submit
                        </h3>
                        <p className="text-slate-600 text-sm">Review your tender details before submitting</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                📝 Project Name
                              </span>
                              <p className="text-lg font-bold text-slate-900">{projectFormData.name || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                🌍 Country
                              </span>
                              <p className="text-lg font-bold text-slate-900">{selectedCountry || projectFormData.country || 'Not specified'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                📅 Timeline
                              </span>
                              <p className="text-lg font-bold text-slate-900">
                                {projectFormData.startDate || 'Not set'} → {projectFormData.endDate || 'Not set'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                📏 Size & Budget
                              </span>
                              <p className="text-lg font-bold text-slate-900">
                                {projectFormData.size || 'Not specified'} • {projectFormData.budget || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          
                          {projectFormData.description && (
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                💭 Description
                              </span>
                              <p className="text-slate-700 font-medium">{projectFormData.description}</p>
                            </div>
                          )}
                          
                          {projectFormData.materials.length > 0 && (
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                🔧 Materials
                              </span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {projectFormData.materials.map((m, idx) => (
                                  <span key={idx} className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold border border-blue-300 shadow-sm">
                                    🔧 {m}
                                  </span>
                                ))}
                    </div>
                  </div>
                )}

                          {projectFormData.compliance.length > 0 && (
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                ✅ Compliance
                              </span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {projectFormData.compliance.map((c, idx) => (
                                  <span key={idx} className="px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-semibold border border-green-300 shadow-sm">
                                    ✅ {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-6 h-6 text-blue-600 mt-1 rounded focus:ring-blue-500" 
                              checked={createITTNow} 
                              onChange={(e) => setCreateITTNow(e.target.checked)} 
                            />
                            <div>
                              <span className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                🚀 Create ITT immediately
                              </span>
                              <p className="text-blue-700 text-sm mt-1 font-medium">
                                Automatically create and assign an Invitation to Tender for this project after submission
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                                {/* Right Side - Country Preview */}
                <div className="w-80 flex-shrink-0">
                  <div className="sticky top-6">
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        🌍 Country Preview
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                      </h4>
                      
                      {selectedCountry ? (
                        <div className="space-y-4">
                          {/* Country Flag & Info */}
                          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                            <div className="text-8xl mb-4">{getCountryInfo(selectedCountry).flag}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedCountry}</h3>
                            <div className="flex items-center justify-center gap-2 text-slate-600">
                              <span className="text-2xl">{getCountryInfo(selectedCountry).emoji}</span>
                              <span className="font-medium">{getCountryInfo(selectedCountry).region}</span>
                            </div>
                          </div>
                          
                          {/* Project Info */}
                          <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1">
                              🏗️ Project Location
                            </h5>
                            <p className="text-sm text-slate-600">
                              Your construction tender will be located in <span className="font-bold text-blue-600">{selectedCountry}</span>
                            </p>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <div className="text-green-600 font-bold text-lg">✅</div>
                              <div className="text-xs font-medium text-green-700">Location Set</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <div className="text-blue-600 font-bold text-lg">🌐</div>
                              <div className="text-xs font-medium text-blue-700">Global Reach</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-80 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-blue-300 flex items-center justify-center">
                          <div className="text-center text-slate-500 p-6">
                            <div className="text-6xl mb-4 animate-bounce">🌍</div>
                            <h5 className="text-lg font-bold text-slate-700 mb-2">Select a Country</h5>
                            <p className="text-sm font-medium mb-2">Choose your project location</p>
                            <p className="text-xs text-slate-400">🔍 Search from 195+ countries worldwide</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </div>

            {/* Bottom Actions */}
            <div className="border-t-2 border-blue-100 pt-4 mt-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
              <div className="flex items-center justify-between px-2">
                <Button 
                  variant="outline" 
                  className="h-12 px-6 border-2 border-slate-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all" 
                  onClick={() => {
                    const draft = {
                      currentStep: tenderStep as 1|2|3|4,
                      selectedCountry,
                      formData: projectFormData
                    }
                    if (saveTenderDraft) saveTenderDraft(draft as any)
                    setOpenCreateTender(false)
                  }}
                >
                  💾 Save for Later
                </Button>
                
                <div className="flex items-center gap-3">
                  {tenderStep > 1 && (
                    <Button 
                      variant="outline" 
                      className="h-12 px-6 border-2 border-slate-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all" 
                      onClick={() => setTenderStep((prev) => (prev - 1) as any)}
                    >
                      ← Back
                    </Button>
                  )}
                  
                  {tenderStep < 4 ? (
                    <Button 
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
                      onClick={() => {
                        // Validation for step 1 - country is required
                        if (tenderStep === 1 && !selectedCountry) {
                          alert('🌍 Please select a country/region before continuing!')
                          return
                        }
                        setTenderStep((prev) => (prev + 1) as any)
                      }}
                    >
                      Next → ✨
                    </Button>
                  ) : (
                    <Button 
                      className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
                      onClick={handleCreateTender}
                    >
                      🚀 Create Tender
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Tenders (Drafts) */}
      {tenderDrafts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">Pending Tenders</h2>
            <p className="text-sm text-neutral-500">Resume editing saved drafts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenderDrafts.map((d) => (
              <Card key={d.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{d.formData.name || 'Untitled Tender'}</CardTitle>
                  <CardDescription className="text-sm">{d.selectedCountry || d.formData.country || '-'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-neutral-500">Saved {new Date(d.savedAt).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setProjectFormData(d.formData)
                      setSelectedCountry(d.selectedCountry)
                      setTenderStep(d.currentStep)
                      setOpenCreateTender(true)
                    }}>Resume</Button>
                    <Button size="sm" variant="outline" onClick={() => removeTenderDraft && removeTenderDraft(d.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Your Projects */}
      {userProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base leading-tight">{p.name}</CardTitle>
                    <CardDescription className="text-sm">{p.country}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && <div className="text-sm text-neutral-600 line-clamp-3">{p.description}</div>}
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>{p.startDate || '-'} → {p.endDate || '-'}</span>
                  <span>{p.sizeBucket || ''}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" className="h-9" onClick={() => {
                    setIttFormData && setIttFormData((prev: any) => ({ ...prev, project: p.name, region: (p.country || '').toLowerCase() }))
                    setActiveTab && setActiveTab('itt-manager')
                    setShowCreateITT && setShowCreateITT(true)
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add / Assign ITT
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive World Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              🌍 Global Performance Heatmap
            </h2>
            <p className="text-neutral-500 text-sm mt-1">Interactive world map showing regional project performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-neutral-200 hover:bg-neutral-100">
              Clear Filter
            </Button>
          </div>
        </div>
        
        <WorldMap 
          projects={projects} 
          regionData={regionData}
        />
        
        {/* Regional Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {regionData.map((region) => (
            <div key={region.region} className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: region.color }}
                />
                <span className="font-semibold text-sm text-neutral-800">{region.region}</span>
              </div>
              <div className="text-xs text-neutral-500">
                {region.activeProjects} active projects
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}