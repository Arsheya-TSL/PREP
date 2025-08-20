import { PageType, WidgetSize, ITTFormData, ProjectFormData, ActiveITT, Widget, WorkPackage } from './types'
import { projects, workPackages } from './constants'
import { parseSimpleCSV } from './utils'
import { defaultITTFormData, defaultProjectFormData } from './defaultFormData'

export const createAppHandlers = (
  activeTab: PageType,
  setWidgets: (fn: (prev: Widget[]) => Widget[]) => void,
  setIttFormData: (data: ITTFormData | ((prev: ITTFormData) => ITTFormData)) => void,
  setProjectFormData: (data: ProjectFormData | ((prev: ProjectFormData) => ProjectFormData)) => void,
  setShowCreateITT: (show: boolean) => void,
  setShowCreateProject: (show: boolean) => void,
  setCreateProjectStep: (step: number) => void,
  setComparisonProjects: (fn: (prev: number[]) => number[]) => void,
  setSupplierComparison: (fn: (prev: string[]) => string[]) => void,
  addITT?: (itt: ActiveITT) => void,
  setActiveTab?: (tab: PageType) => void
) => {
  // Enhanced widget management functions
  const getPageWidgets = (page: PageType) => {
    // This function will be called from the component with the current widgets state
    return []
  }

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map((w: Widget) => w.id === widgetId ? { ...w, enabled: !w.enabled } : w))
  }

  const updateWidgetSize = (widgetId: string, size: WidgetSize) => {
    setWidgets(prev => prev.map((w: Widget) => w.id === widgetId ? { ...w, size } : w))
  }

  // Enhanced drag & drop with grid snapping
  const moveWidget = (dragIndex: number, dropIndex: number) => {
    setWidgets(prev => {
      const pageWidgets = prev.filter((w: Widget) => w.enabled && w.pages.includes(activeTab)).sort((a, b) => a.order - b.order)
      const newPageWidgets = [...pageWidgets]
      const draggedWidget = newPageWidgets[dragIndex]
      
      newPageWidgets.splice(dragIndex, 1)
      newPageWidgets.splice(dropIndex, 0, draggedWidget)
      
      const updatedWidgets = newPageWidgets.map((widget, index) => ({
        ...widget,
        order: index + 1
      }))
      
      const otherWidgets = prev.filter((w: Widget) => !w.enabled || !w.pages.includes(activeTab))
      
      return [...updatedWidgets, ...otherWidgets]
    })
  }

  // Enhanced comparison functions
  const toggleProjectComparison = (projectId: number) => {
    setComparisonProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else if (prev.length < 3) {
        return [...prev, projectId]
      }
      return prev
    })
  }

  const toggleSupplierComparison = (supplierName: string) => {
    setSupplierComparison(prev => {
      if (prev.includes(supplierName)) {
        return prev.filter(name => name !== supplierName)
      } else if (prev.length < 3) {
        return [...prev, supplierName]
      }
      return prev
    })
  }

  // Enhanced auto-fill ITT from project data with comprehensive mapping
  const autoFillITTFromProject = (projectName: string) => {
    const project = projects.find(p => p.name === projectName)
    if (project) {
      const estimatedBudgetRange = {
        min: Math.round(project.budget * 0.05 / 1000),
        max: Math.round(project.budget * 0.15 / 1000)
      }

      setIttFormData(prev => ({
        ...prev,
        project: projectName,
        materials: project.materials,
        budget: `£${estimatedBudgetRange.min}K - £${estimatedBudgetRange.max}K`,
        specialRequirements: `For ${project.name} project in ${project.location}. Project size: ${project.size}. ${project.tradeCategories.length > 0 ? `Trade categories: ${project.tradeCategories.join(", ")}.` : ''}`,
        scope: `${project.tradeCategories.join(", ")} work required for ${project.size.toLowerCase()} project. Materials needed: ${project.materials.join(", ")}.`,
        region: project.country.toLowerCase(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
      }))
    }
  }

  // Enhanced auto-generate ITT from project data with full integration
  const handleAutoGenerateITT = (projectData: ProjectFormData) => {
    if (!projectData.autoGenerateITT) return

    console.log("🚀 Auto-generating ITT for project:", projectData.name)

    // Pre-fill ITT form with comprehensive project data
    const estimatedBudgetRange = projectData.budget ? {
      min: Math.round(parseInt(projectData.budget) * 0.05 / 1000),
      max: Math.round(parseInt(projectData.budget) * 0.15 / 1000)
    } : { min: 10, max: 50 }

    // Generate comprehensive scope description
    const scopeDescription = `
${projectData.tradeCategories.length > 0 ? `${projectData.tradeCategories.join(", ")} work` : 'Construction work'} for ${projectData.name}.

Project Overview:
- Location: ${projectData.location}, ${projectData.country}
- Project Size: ${projectData.size}
- Duration: ${projectData.startDate} to ${projectData.endDate}
${projectData.description ? `\n- Description: ${projectData.description}` : ''}

Materials Required: ${projectData.materials.join(", ")}

${projectData.compliance.length > 0 ? `Compliance Requirements: ${projectData.compliance.join(", ")}` : ''}

${projectData.specialRequirements ? `Special Requirements: ${projectData.specialRequirements}` : ''}
    `.trim()

    const ittData: ITTFormData = {
      project: projectData.name,
      category: projectData.tradeCategories[0] || "general",
      scope: scopeDescription,
      budget: `£${estimatedBudgetRange.min}K - £${estimatedBudgetRange.max}K`,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days
      region: projectData.country.toLowerCase(),
      suppliers: [],
      materials: projectData.materials,
      quantities: {},
      specialRequirements: projectData.specialRequirements,
      compliance: projectData.compliance,
      description: projectData.description || scopeDescription
    }

    setIttFormData(ittData)

    // Show success message and automatically open ITT creation
    console.log("✅ ITT pre-filled with project data")
    console.log("📋 Generated ITT preview:", {
      project: ittData.project,
      materials: ittData.materials.length,
      categories: projectData.tradeCategories.length,
      compliance: ittData.compliance.length
    })

    // Auto-open ITT creation modal after brief delay
    setTimeout(() => {
      console.log("📝 Opening ITT Manager with pre-filled data...")
      setShowCreateITT(true)
    }, 1500)
  }

  // Enhanced ITT creation with supplier auto-matching
  const handleCreateITT = () => {
    console.log("🎯 Creating ITT with supplier matching...")
    setIttFormData(prev => {
      console.log("📊 ITT Details:", {
        project: prev.project,
        suppliers: prev.suppliers.length,
        materials: prev.materials.length,
        category: prev.category,
        region: prev.region,
        deadline: prev.deadline
      })

      // Persist to in-memory user ITTs list if provided
      if (addITT) {
        const newItt: ActiveITT = {
          id: Date.now(),
          project: prev.project,
          category: prev.category || 'General',
          status: 'Draft',
          created: new Date().toISOString().split('T')[0],
          deadline: prev.deadline || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
          suppliers: prev.suppliers,
          responses: 0,
          budget: parseInt((prev.budget || '0').toString().replace(/[^0-9]/g, '')) || 0,
          region: (prev.region || '').toString().toUpperCase() || 'ALL'
        }
        addITT(newItt)
      }

      return prev
    })
    
    // Simulate ITT creation process
    console.log("✅ ITT created successfully")
    console.log("📧 Invitations sent to selected suppliers")
    console.log("📈 ITT tracking started")
    
    // Reset form and close modal
    setIttFormData(defaultITTFormData)
    setShowCreateITT(false)

    // Navigate to ITT Manager if provided
    if (setActiveTab) {
      setActiveTab('itt-manager')
    }
  }

  // Enhanced project creation with full workflow integration
  const handleCreateProject = () => {
    console.log("🏗️ Creating new project with full integration...")
    
    // Simulate comprehensive project creation
    const steps = [
      "🔄 Creating project structure...",
      "👥 Setting up team access permissions...",
      "📁 Configuring SharePoint folder templates...",
      "🔗 Linking Microsoft Teams channel...",
      "📊 Initializing project dashboard...",
      "🎯 Generating supplier recommendations...",
      "✅ Project creation completed!"
    ]

    steps.forEach((step, index) => {
      setTimeout(() => {
        console.log(step)
      }, index * 800)
    })

    // Final success message
    setTimeout(() => {
      console.log("🎉 Project successfully added to Projects page")
      console.log("🔄 Dashboard widgets updated with new project data")
    }, steps.length * 800)
    
    // Reset form and close modal
    setProjectFormData(defaultProjectFormData)
    setShowCreateProject(false)
    setCreateProjectStep(1)
  }

  return {
    getPageWidgets,
    toggleWidget,
    updateWidgetSize,
    moveWidget,
    toggleProjectComparison,
    toggleSupplierComparison,
    autoFillITTFromProject,
    handleAutoGenerateITT,
    handleCreateITT,
    handleCreateProject
  }
}

// Simple in-memory importer for Work Packages from raw CSV text
export function importWorkPackagesFromCSV(csvText: string): { imported: number; replaced: number } {
  const rows = parseSimpleCSV(csvText)
  let imported = 0
  let replaced = 0
  rows.forEach(r => {
    const coinsCode = r['coins code'] || r['coinscode'] || r['coins_code'] || r['coins'] || ''
    const description = r['description'] || ''
    const idStr = r['id'] || ''
    if (!coinsCode || !description) return
    const idNum = Number(idStr) || Math.floor(Math.random()*1e9)
    const wp: WorkPackage = { coinsCode, description, id: idNum }
    const idx = workPackages.findIndex(x => x.coinsCode.toLowerCase() === coinsCode.toLowerCase())
    if (idx >= 0) {
      workPackages[idx] = { ...workPackages[idx], ...wp }
      replaced++
    } else {
      workPackages.push(wp)
      imported++
    }
  })
  return { imported, replaced }
}