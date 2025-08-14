# API Integration Guide for PREP Construction Management System

## Overview

The PREP system is now ready for real API integration! We've built a complete data layer that makes it easy to switch between mock data (for development) and real APIs (for production).

## 🏗️ Architecture

### Data Layer Structure
```
lib/
├── api.ts              # API service classes and interfaces
├── DataContext.tsx     # React context for data management
└── constants.ts        # Mock data (for development)

components/ui/
└── APIConfig.tsx       # UI for switching between mock/real data
```

## 🚀 Quick Start

### 1. Current State
- **Mock Data Active**: The system currently uses mock data from `lib/constants.ts`
- **API Ready**: All components are prepared to use real APIs
- **Easy Switch**: Toggle between mock and real data using the floating config button

### 2. Switching to Real APIs

#### Step 1: Configure API Endpoints
1. Click the **floating settings button** (⚙️) in the bottom-right corner
2. Toggle **"Use Mock Data"** to OFF
3. Enter your **API Base URL** (e.g., `https://your-api.com/api`)
4. Click **"Save Config"**

#### Step 2: Implement Your API Endpoints
Your API should provide these endpoints:

```
GET    /api/projects          # Get all projects
POST   /api/projects          # Create new project
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project

GET    /api/itts             # Get all ITTs
POST   /api/itts             # Create new ITT
PUT    /api/itts/:id         # Update ITT
DELETE /api/itts/:id         # Delete ITT

GET    /api/suppliers        # Get all suppliers
POST   /api/suppliers        # Create new supplier
PUT    /api/suppliers/:id    # Update supplier
DELETE /api/suppliers/:id    # Delete supplier

GET    /api/dashboard/stats  # Get dashboard statistics
```

## 📊 Data Interfaces

### Project Interface
```typescript
interface Project {
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
```

### ITT Interface
```typescript
interface ITT {
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
```

### Supplier Interface
```typescript
interface Supplier {
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
```

## 🔧 Using the Data Context

### In Components
```typescript
import { useData } from '../lib/DataContext'

function MyComponent() {
  const { 
    projects, 
    projectsLoading, 
    createProject, 
    refreshProjects 
  } = useData()

  // Use the data and functions
  if (projectsLoading) return <div>Loading...</div>
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### Available Functions
- **Projects**: `projects`, `projectsLoading`, `createProject`, `updateProject`, `deleteProject`, `refreshProjects`
- **ITTs**: `itts`, `ittsLoading`, `createITT`, `updateITT`, `deleteITT`, `refreshITTs`
- **Suppliers**: `suppliers`, `suppliersLoading`, `createSupplier`, `updateSupplier`, `deleteSupplier`, `refreshSuppliers`
- **Dashboard**: `dashboardStats`, `dashboardLoading`, `refreshDashboard`

## 🌍 Environment Configuration

### Development
```bash
# Use mock data (default)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Production
```bash
# Use real API
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## 🔄 Migration Steps

### 1. Prepare Your API
- Implement all required endpoints
- Ensure data matches the interfaces
- Add proper error handling
- Set up CORS if needed

### 2. Test Integration
- Start with one endpoint (e.g., `/api/projects`)
- Use the API config panel to switch
- Verify data loads correctly
- Check error handling

### 3. Gradual Migration
- Switch one section at a time
- Keep mock data as fallback
- Monitor for errors
- Update interfaces if needed

## 🛠️ Customization

### Adding New Endpoints
1. Add to `lib/api.ts`:
```typescript
export class NewAPI {
  static async getData(): Promise<APIResponse<DataType>> {
    return apiClient.get<DataType>('/new-endpoint')
  }
}
```

2. Add to `lib/DataContext.tsx`:
```typescript
// Add state and functions
const [newData, setNewData] = useState<DataType[]>([])
const loadNewData = async () => { /* implementation */ }
```

### Custom Data Transformations
Use the transform functions in `lib/api.ts`:
```typescript
export const transformCustomData = (apiData: APIType) => {
  return {
    // Transform to match UI expectations
  }
}
```

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your API allows requests from your frontend domain
2. **Data Mismatch**: Check that your API response matches the expected interfaces
3. **Network Errors**: Verify API URL and network connectivity
4. **Loading States**: Components automatically handle loading states

### Debug Mode
- Use browser dev tools to see API requests
- Check the console for error messages
- Use the API config panel to monitor status

## 📈 Performance

### Optimization Tips
- Implement pagination for large datasets
- Use caching strategies
- Consider implementing React Query or SWR for advanced caching
- Monitor API response times

### Caching Strategy
The current implementation includes basic caching. For production, consider:
- React Query for server state management
- SWR for data fetching
- Redis for server-side caching

## 🚀 Next Steps

1. **Implement Your API** following the interface specifications
2. **Test with Real Data** using the config panel
3. **Add Authentication** if required
4. **Implement Error Handling** for production use
5. **Add Real-time Updates** using WebSockets if needed

## 📞 Support

If you need help with API integration:
1. Check the console for error messages
2. Verify your API endpoints match the expected format
3. Use the API config panel to test connectivity
4. Review the data interfaces for compatibility

---

**Ready to go live with real data! 🎉** 