'use client'

import { useCallback } from "react"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAppState } from "./hooks/useAppState"
import { createAppHandlers } from "./lib/appHandlers"
import AppLayout from "./components/layout/AppLayout"
import DashboardPage from "./components/pages/DashboardPage"
import SupplyChainPage from "./components/pages/SupplyChainPage"
import ITTManagerPage from "./components/pages/ITTManagerPage"
import ProjectsPage from "./components/pages/ProjectsPage"
import WorldMapPage from "./components/pages/WorldMapPage"
import WorldMapV2Page from "./components/pages/WorldMapV2Page"
import SettingsPage from "./components/pages/SettingsPage"
import CreateProjectModal from "./components/modals/CreateProjectModal"

export default function App() {
  const state = useAppState()
  
  const handlers = createAppHandlers(
    state.activeTab,
    state.setWidgets,
    state.setIttFormData,
    state.setProjectFormData,
    state.setShowCreateITT,
    state.setShowCreateProject,
    state.setCreateProjectStep,
    state.setComparisonProjects,
    state.setSupplierComparison,
    state.addITT,
    (tab) => state.setActiveTab(tab)
  )

  // Enhanced widget management functions with current state
  const getPageWidgets = useCallback((page: typeof state.activeTab) => {
    return state.widgets.filter(w => w.enabled && w.pages.includes(page)).sort((a, b) => a.order - b.order)
  }, [state.widgets])

  const enabledWidgets = getPageWidgets(state.activeTab)

  const moveWidget = useCallback((dragIndex: number, dropIndex: number) => {
    handlers.moveWidget(dragIndex, dropIndex)
  }, [handlers, state.activeTab])

  return (
    <DndProvider backend={HTML5Backend}>
      <AppLayout activeTab={state.activeTab} setActiveTab={(tab: string) => state.setActiveTab(tab as any)}>
        {state.activeTab === "dashboard" && (
          <DashboardPage />
        )}

        {state.activeTab === "supply-chain" && (
          <SupplyChainPage 
            widgets={state.widgets}
            getPageWidgets={getPageWidgets}
            moveWidget={moveWidget}
            updateWidgetSize={handlers.updateWidgetSize}
            customizeMode={state.customizeMode}
            supplierViewMode={state.supplierViewMode}
            setSupplierViewMode={state.setSupplierViewMode}
            supplierComparison={state.supplierComparison}
            toggleSupplierComparison={handlers.toggleSupplierComparison}
            showSupplierComparison={state.showSupplierComparison}
            setShowSupplierComparison={state.setShowSupplierComparison}
            screenSize={state.screenSize}
          />
        )}

        {state.activeTab === "itt-manager" && (
          <ITTManagerPage 
            widgets={state.widgets}
            getPageWidgets={getPageWidgets}
            moveWidget={moveWidget}
            updateWidgetSize={handlers.updateWidgetSize}
            customizeMode={state.customizeMode}
            showCreateITT={state.showCreateITT}
            setShowCreateITT={state.setShowCreateITT}
            ittFormData={state.ittFormData}
            setIttFormData={state.setIttFormData}
            autoFillITTFromProject={handlers.autoFillITTFromProject}
            handleCreateITT={handlers.handleCreateITT}
            screenSize={state.screenSize}
            userITTs={state.userITTs}
            userProjects={state.userProjects}
          />
        )}

        {state.activeTab === "projects" && (
          <ProjectsPage 
            comparisonProjects={state.comparisonProjects}
            setShowComparison={state.setShowComparison}
            showCreateProject={state.showCreateProject}
            setShowCreateProject={state.setShowCreateProject}
            createProjectStep={state.createProjectStep}
            setCreateProjectStep={state.setCreateProjectStep}
            projectFormData={state.projectFormData}
            setProjectFormData={state.setProjectFormData}
            handleCreateProject={handlers.handleCreateProject}
            // Added: projects and ITT/map wiring
            userProjects={state.userProjects}
            addProject={state.addProject}
            addITT={state.addITT}
            addHighlightedCountry={state.addHighlightedCountry}
            setActiveTab={(tab: string) => state.setActiveTab(tab as any)}
            setShowCreateITT={state.setShowCreateITT}
            setIttFormData={state.setIttFormData}
            tenderDrafts={state.tenderDrafts}
            saveTenderDraft={state.saveTenderDraft}
            updateTenderDraft={state.updateTenderDraft}
            removeTenderDraft={state.removeTenderDraft}
          />
        )}

        {state.activeTab === "world-map" && (
          <WorldMapPage />
        )}

        {state.activeTab === "world-map-v2" && (
          <WorldMapV2Page />
        )}

        {/* Basic page for cost-system */}
        {state.activeTab === "cost-system" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Cost System</h1>
              <p className="text-neutral-500 mt-1">Financial management and budget tracking</p>
            </div>
          </div>
        )}
      </AppLayout>

      {/* Modals */}
      <CreateProjectModal
        open={state.showCreateProject}
        onOpenChange={state.setShowCreateProject}
        projectFormData={state.projectFormData}
        setProjectFormData={state.setProjectFormData}
        onCreateProject={handlers.handleCreateProject}
        onAutoGenerateITT={handlers.handleAutoGenerateITT}
      />
    </DndProvider>
  )
}