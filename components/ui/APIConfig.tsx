"use client"

import React, { useState } from 'react'
import { useData } from '../../lib/DataContext'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Switch } from './switch'
import { Settings, Database, Wifi, RefreshCw } from 'lucide-react'

export const APIConfig: React.FC = () => {
  const { 
    useMockData, 
    setUseMockData, 
    apiBaseUrl, 
    setApiBaseUrl,
    refreshProjects,
    refreshITTs,
    refreshSuppliers,
    refreshDashboard
  } = useData()

  const [isOpen, setIsOpen] = useState(false)
  const [tempApiUrl, setTempApiUrl] = useState(apiBaseUrl)

  const handleSaveConfig = () => {
    setApiBaseUrl(tempApiUrl)
    setIsOpen(false)
  }

  const handleRefreshAll = async () => {
    await Promise.all([
      refreshProjects(),
      refreshITTs(),
      refreshSuppliers(),
      refreshDashboard()
    ])
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Config Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700"
        title="API Configuration"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Configuration Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl border border-neutral-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Configuration
            </CardTitle>
            <CardDescription>
              Switch between mock data and real API endpoints
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Mock Data Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Use Mock Data</Label>
                <p className="text-xs text-neutral-500">
                  {useMockData ? 'Using local mock data' : 'Using real API endpoints'}
                </p>
              </div>
              <Switch
                checked={useMockData}
                onCheckedChange={setUseMockData}
              />
            </div>

            {/* API URL Configuration */}
            {!useMockData && (
              <div className="space-y-2">
                <Label htmlFor="api-url" className="text-sm font-medium">
                  API Base URL
                </Label>
                <Input
                  id="api-url"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="http://localhost:3000/api"
                  className="text-sm"
                />
                <p className="text-xs text-neutral-500">
                  Base URL for your API endpoints
                </p>
              </div>
            )}

            {/* Status Indicators */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${useMockData ? 'bg-green-500' : 'bg-blue-500'}`} />
                <span className="text-neutral-600">
                  {useMockData ? 'Mock Data Active' : 'Real API Active'}
                </span>
              </div>
              
              {!useMockData && (
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-500">
                    {apiBaseUrl}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {!useMockData && (
                <Button
                  onClick={handleSaveConfig}
                  size="sm"
                  className="flex-1"
                >
                  Save Config
                </Button>
              )}
              
              <Button
                onClick={handleRefreshAll}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh All
              </Button>
            </div>

            {/* Environment Info */}
            <div className="pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Environment:</span>
                <span className="font-mono">
                  {process.env.NODE_ENV}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default APIConfig 