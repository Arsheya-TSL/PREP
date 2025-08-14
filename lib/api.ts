// API Service Layer for PREP Construction Management System
// This handles all data fetching and will be easy to switch from mock to real APIs

export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = 10000 // 10 seconds

// Generic API client
class APIClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Initialize API client
export const apiClient = new APIClient(API_BASE_URL, API_TIMEOUT)

// Data interfaces for real API responses
export interface Project {
  id: string
  name: string
  description: string
  country: string
  region: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  budget: number
  sizeBucket: 'small' | 'medium' | 'large' | 'xl'
  category: string
  manager: string
  client: string
  progress: number
  risks: Risk[]
  createdAt: string
  updatedAt: string
}

export interface Risk {
  id: string
  title: string
  description: string
  level: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
  assignedTo: string
  dueDate: string
  status: 'open' | 'in-progress' | 'resolved'
}

export interface ITT {
  id: string
  projectId: string
  projectName: string
  category: string
  description: string
  status: 'draft' | 'sent' | 'received' | 'in-review' | 'awarded'
  responses: number
  suppliers: Supplier[]
  deadline: string
  budget: number
  region: string
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  category: string
  region: string
  rating: number
  onTimeDelivery: number
  qualityScore: number
  costSavings: number
  approved: boolean
  contactEmail: string
  contactPhone: string
  lastOrderDate: string
  totalOrders: number
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalBudget: number
  completionRate: number
  topCountries: Array<{ country: string; count: number }>
  monthlyProgress: Array<{ month: string; completed: number; total: number }>
}

// API Service Classes
export class ProjectsAPI {
  static async getAll(): Promise<APIResponse<Project[]>> {
    return apiClient.get<Project[]>('/projects')
  }

  static async getById(id: string): Promise<APIResponse<Project>> {
    return apiClient.get<Project>(`/projects/${id}`)
  }

  static async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Project>> {
    return apiClient.post<Project>('/projects', project)
  }

  static async update(id: string, project: Partial<Project>): Promise<APIResponse<Project>> {
    return apiClient.put<Project>(`/projects/${id}`, project)
  }

  static async delete(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/projects/${id}`)
  }

  static async getByStatus(status: Project['status']): Promise<APIResponse<Project[]>> {
    return apiClient.get<Project[]>(`/projects?status=${status}`)
  }

  static async getByCountry(country: string): Promise<APIResponse<Project[]>> {
    return apiClient.get<Project[]>(`/projects?country=${country}`)
  }
}

export class ITTsAPI {
  static async getAll(): Promise<APIResponse<ITT[]>> {
    return apiClient.get<ITT[]>('/itts')
  }

  static async getById(id: string): Promise<APIResponse<ITT>> {
    return apiClient.get<ITT>(`/itts/${id}`)
  }

  static async create(itt: Omit<ITT, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<ITT>> {
    return apiClient.post<ITT>('/itts', itt)
  }

  static async update(id: string, itt: Partial<ITT>): Promise<APIResponse<ITT>> {
    return apiClient.put<ITT>(`/itts/${id}`, itt)
  }

  static async delete(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/itts/${id}`)
  }

  static async getByProject(projectId: string): Promise<APIResponse<ITT[]>> {
    return apiClient.get<ITT[]>(`/itts?projectId=${projectId}`)
  }

  static async getByStatus(status: ITT['status']): Promise<APIResponse<ITT[]>> {
    return apiClient.get<ITT[]>(`/itts?status=${status}`)
  }
}

export class SuppliersAPI {
  static async getAll(): Promise<APIResponse<Supplier[]>> {
    return apiClient.get<Supplier[]>('/suppliers')
  }

  static async getById(id: string): Promise<APIResponse<Supplier>> {
    return apiClient.get<Supplier>(`/suppliers/${id}`)
  }

  static async create(supplier: Omit<Supplier, 'id'>): Promise<APIResponse<Supplier>> {
    return apiClient.post<Supplier>('/suppliers', supplier)
  }

  static async update(id: string, supplier: Partial<Supplier>): Promise<APIResponse<Supplier>> {
    return apiClient.put<Supplier>(`/suppliers/${id}`, supplier)
  }

  static async delete(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/suppliers/${id}`)
  }

  static async getByCategory(category: string): Promise<APIResponse<Supplier[]>> {
    return apiClient.get<Supplier[]>(`/suppliers?category=${category}`)
  }

  static async getApproved(): Promise<APIResponse<Supplier[]>> {
    return apiClient.get<Supplier[]>('/suppliers?approved=true')
  }
}

export class DashboardAPI {
  static async getStats(): Promise<APIResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats')
  }

  static async getProjectProgress(): Promise<APIResponse<any>> {
    return apiClient.get<any>('/dashboard/project-progress')
  }

  static async getRegionalStats(): Promise<APIResponse<any>> {
    return apiClient.get<any>('/dashboard/regional-stats')
  }
}

// Data fetching hooks for React components
export const useProjects = () => {
  // This will be replaced with React Query or SWR
  // For now, returns mock data
  return {
    data: [] as Project[],
    loading: false,
    error: null,
    refetch: () => {},
  }
}

export const useITTs = () => {
  return {
    data: [] as ITT[],
    loading: false,
    error: null,
    refetch: () => {},
  }
}

export const useSuppliers = () => {
  return {
    data: [] as Supplier[],
    loading: false,
    error: null,
    refetch: () => {},
  }
}

export const useDashboardStats = () => {
  return {
    data: null as DashboardStats | null,
    loading: false,
    error: null,
    refetch: () => {},
  }
}

// Utility functions for data transformation
export const transformProjectData = (apiProject: Project) => {
  // Transform API data to match our UI expectations
  return {
    id: apiProject.id,
    name: apiProject.name,
    country: apiProject.country,
    startDate: apiProject.startDate,
    endDate: apiProject.endDate,
    description: apiProject.description,
    sizeBucket: apiProject.sizeBucket,
    status: apiProject.status,
    progress: apiProject.progress,
    budget: apiProject.budget,
  }
}

export const transformITTData = (apiITT: ITT) => {
  return {
    id: apiITT.id,
    project: apiITT.projectName,
    category: apiITT.category,
    status: apiITT.status,
    responses: apiITT.responses,
    suppliers: apiITT.suppliers,
    deadline: apiITT.deadline,
    budget: apiITT.budget,
    region: apiITT.region,
  }
}

export const transformSupplierData = (apiSupplier: Supplier) => {
  return {
    id: apiSupplier.id,
    name: apiSupplier.name,
    category: apiSupplier.category,
    region: apiSupplier.region,
    rating: apiSupplier.rating,
    onTimeDelivery: apiSupplier.onTimeDelivery,
    qualityScore: apiSupplier.qualityScore,
    costSavings: apiSupplier.costSavings,
    approved: apiSupplier.approved,
  }
} 