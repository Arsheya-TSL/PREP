"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  ProjectsAPI, 
  ITTsAPI, 
  SuppliersAPI, 
  DashboardAPI,
  Project,
  ITT,
  Supplier,
  DashboardStats,
  APIResponse
} from './api'

// Data context interface
interface DataContextType {
  // Projects
  projects: Project[]
  projectsLoading: boolean
  projectsError: string | null
  refreshProjects: () => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>

  // ITTs
  itts: ITT[]
  ittsLoading: boolean
  ittsError: string | null
  refreshITTs: () => Promise<void>
  createITT: (itt: Omit<ITT, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updateITT: (id: string, itt: Partial<ITT>) => Promise<boolean>
  deleteITT: (id: string) => Promise<boolean>

  // Suppliers
  suppliers: Supplier[]
  suppliersLoading: boolean
  suppliersError: string | null
  refreshSuppliers: () => Promise<void>
  createSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<boolean>
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<boolean>
  deleteSupplier: (id: string) => Promise<boolean>

  // Dashboard
  dashboardStats: DashboardStats | null
  dashboardLoading: boolean
  dashboardError: string | null
  refreshDashboard: () => Promise<void>

  // Configuration
  useMockData: boolean
  setUseMockData: (useMock: boolean) => void
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined)

// Provider component
interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Configuration state
  const [useMockData, setUseMockData] = useState(true) // Start with mock data
  const [apiBaseUrl, setApiBaseUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api')

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  // ITTs state
  const [itts, setITTs] = useState<ITT[]>([])
  const [ittsLoading, setITTsLoading] = useState(false)
  const [ittsError, setITTsError] = useState<string | null>(null)

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [suppliersError, setSuppliersError] = useState<string | null>(null)

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Mock data functions (for development)
  const loadMockProjects = async () => {
    // Import mock data from constants
    const { projects: mockProjects } = await import('./constants')
    setProjects(mockProjects as Project[])
    setProjectsError(null)
  }

  const loadMockITTs = async () => {
    const { activeITTs: mockITTs } = await import('./constants')
    setITTs(mockITTs as ITT[])
    setITTsError(null)
  }

  const loadMockSuppliers = async () => {
    const { supplierPerformanceData: mockSuppliers } = await import('./constants')
    setSuppliers(mockSuppliers as Supplier[])
    setSuppliersError(null)
  }

  const loadMockDashboard = async () => {
    // Create mock dashboard stats
    const mockStats: DashboardStats = {
      totalProjects: 25,
      activeProjects: 18,
      totalBudget: 15000000,
      completionRate: 72,
      topCountries: [
        { country: 'UK', count: 8 },
        { country: 'Germany', count: 5 },
        { country: 'France', count: 4 },
        { country: 'Netherlands', count: 3 },
        { country: 'Spain', count: 2 }
      ],
      monthlyProgress: [
        { month: 'Jan', completed: 2, total: 25 },
        { month: 'Feb', completed: 3, total: 25 },
        { month: 'Mar', completed: 4, total: 25 },
        { month: 'Apr', completed: 2, total: 25 },
        { month: 'May', completed: 3, total: 25 },
        { month: 'Jun', completed: 5, total: 25 }
      ]
    }
    setDashboardStats(mockStats)
    setDashboardError(null)
  }

  // Real API functions
  const loadRealProjects = async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    
    try {
      const response = await ProjectsAPI.getAll()
      if (response.success && response.data) {
        setProjects(response.data)
      } else {
        setProjectsError(response.error || 'Failed to load projects')
      }
    } catch (error) {
      setProjectsError('Network error loading projects')
    } finally {
      setProjectsLoading(false)
    }
  }

  const loadRealITTs = async () => {
    setITTsLoading(true)
    setITTsError(null)
    
    try {
      const response = await ITTsAPI.getAll()
      if (response.success && response.data) {
        setITTs(response.data)
      } else {
        setITTsError(response.error || 'Failed to load ITTs')
      }
    } catch (error) {
      setITTsError('Network error loading ITTs')
    } finally {
      setITTsLoading(false)
    }
  }

  const loadRealSuppliers = async () => {
    setSuppliersLoading(true)
    setSuppliersError(null)
    
    try {
      const response = await SuppliersAPI.getAll()
      if (response.success && response.data) {
        setSuppliers(response.data)
      } else {
        setSuppliersError(response.error || 'Failed to load suppliers')
      }
    } catch (error) {
      setSuppliersError('Network error loading suppliers')
    } finally {
      setSuppliersLoading(false)
    }
  }

  const loadRealDashboard = async () => {
    setDashboardLoading(true)
    setDashboardError(null)
    
    try {
      const response = await DashboardAPI.getStats()
      if (response.success && response.data) {
        setDashboardStats(response.data)
      } else {
        setDashboardError(response.error || 'Failed to load dashboard stats')
      }
    } catch (error) {
      setDashboardError('Network error loading dashboard stats')
    } finally {
      setDashboardLoading(false)
    }
  }

  // Public refresh functions
  const refreshProjects = async () => {
    if (useMockData) {
      await loadMockProjects()
    } else {
      await loadRealProjects()
    }
  }

  const refreshITTs = async () => {
    if (useMockData) {
      await loadMockITTs()
    } else {
      await loadRealITTs()
    }
  }

  const refreshSuppliers = async () => {
    if (useMockData) {
      await loadMockSuppliers()
    } else {
      await loadRealSuppliers()
    }
  }

  const refreshDashboard = async () => {
    if (useMockData) {
      await loadMockDashboard()
    } else {
      await loadRealDashboard()
    }
  }

  // CRUD operations
  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (useMockData) {
      // Add to mock data
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProjects(prev => [...prev, newProject])
      return true
    } else {
      const response = await ProjectsAPI.create(project)
      if (response.success) {
        await refreshProjects()
        return true
      }
      return false
    }
  }

  const updateProject = async (id: string, project: Partial<Project>): Promise<boolean> => {
    if (useMockData) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project, updatedAt: new Date().toISOString() } : p))
      return true
    } else {
      const response = await ProjectsAPI.update(id, project)
      if (response.success) {
        await refreshProjects()
        return true
      }
      return false
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    if (useMockData) {
      setProjects(prev => prev.filter(p => p.id !== id))
      return true
    } else {
      const response = await ProjectsAPI.delete(id)
      if (response.success) {
        await refreshProjects()
        return true
      }
      return false
    }
  }

  const createITT = async (itt: Omit<ITT, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (useMockData) {
      const newITT: ITT = {
        ...itt,
        id: `itt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setITTs(prev => [...prev, newITT])
      return true
    } else {
      const response = await ITTsAPI.create(itt)
      if (response.success) {
        await refreshITTs()
        return true
      }
      return false
    }
  }

  const updateITT = async (id: string, itt: Partial<ITT>): Promise<boolean> => {
    if (useMockData) {
      setITTs(prev => prev.map(i => i.id === id ? { ...i, ...itt, updatedAt: new Date().toISOString() } : i))
      return true
    } else {
      const response = await ITTsAPI.update(id, itt)
      if (response.success) {
        await refreshITTs()
        return true
      }
      return false
    }
  }

  const deleteITT = async (id: string): Promise<boolean> => {
    if (useMockData) {
      setITTs(prev => prev.filter(i => i.id !== id))
      return true
    } else {
      const response = await ITTsAPI.delete(id)
      if (response.success) {
        await refreshITTs()
        return true
      }
      return false
    }
  }

  const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<boolean> => {
    if (useMockData) {
      const newSupplier: Supplier = {
        ...supplier,
        id: `supplier-${Date.now()}`,
      }
      setSuppliers(prev => [...prev, newSupplier])
      return true
    } else {
      const response = await SuppliersAPI.create(supplier)
      if (response.success) {
        await refreshSuppliers()
        return true
      }
      return false
    }
  }

  const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<boolean> => {
    if (useMockData) {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s))
      return true
    } else {
      const response = await SuppliersAPI.update(id, supplier)
      if (response.success) {
        await refreshSuppliers()
        return true
      }
      return false
    }
  }

  const deleteSupplier = async (id: string): Promise<boolean> => {
    if (useMockData) {
      setSuppliers(prev => prev.filter(s => s.id !== id))
      return true
    } else {
      const response = await SuppliersAPI.delete(id)
      if (response.success) {
        await refreshSuppliers()
        return true
      }
      return false
    }
  }

  // Load initial data
  useEffect(() => {
    refreshProjects()
    refreshITTs()
    refreshSuppliers()
    refreshDashboard()
  }, [useMockData])

  const value: DataContextType = {
    // Projects
    projects,
    projectsLoading,
    projectsError,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,

    // ITTs
    itts,
    ittsLoading,
    ittsError,
    refreshITTs,
    createITT,
    updateITT,
    deleteITT,

    // Suppliers
    suppliers,
    suppliersLoading,
    suppliersError,
    refreshSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,

    // Dashboard
    dashboardStats,
    dashboardLoading,
    dashboardError,
    refreshDashboard,

    // Configuration
    useMockData,
    setUseMockData,
    apiBaseUrl,
    setApiBaseUrl,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

// Hook to use the data context
export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
} 