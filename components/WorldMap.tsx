'use client'

import { useState } from "react"
import { MapPin, Building2, Star, Users2, AlertTriangle, Wrench } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
// Removed Figma asset import - using CSS background instead

interface Project {
  id: number
  name: string
  location: string
  country: string
  progress: number
  budget: number
  spent: number
  status: string
  deadline: string
  satisfaction: number
  size: string
  score: number
  team: string[]
  suppliers: number
  issuesReported: number
  reworkCost: number
  image: string
}

interface RegionData {
  region: string
  color: string
  performance: string
  projectsOnTime: number
  avgITTResponse: number
  supplierQuality: number
  budgetUsage: number
  activeProjects: number
  totalProjects: number
}

interface WorldMapProps {
  projects: Project[]
  regionData: RegionData[]
  onProjectSelect?: (project: Project) => void
}

export default function WorldMap({ projects, regionData, onProjectSelect }: WorldMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const getCountryData = (country: string) => {
    return regionData.find(r => r.region === country)
  }

  const getCountryProjects = (country: string) => {
    return projects.filter(p => p.country === country)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track": return "bg-green-100 text-green-800"
      case "Delayed": return "bg-red-100 text-red-800"
      case "Ahead": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country)
    setShowCountryModal(true)
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
    setShowCountryModal(false)
  }

  // Country positions on the world map (percentage-based for responsiveness)
  const countries = [
    {
      name: "UK",
      x: "46%", // Approximate position on the world map
      y: "25%",
      width: "3%",
      height: "6%"
    },
    {
      name: "Germany",
      x: "49%",
      y: "27%",
      width: "2.5%",
      height: "4%"
    },
    {
      name: "France",
      x: "47%",
      y: "32%",
      width: "3%",
      height: "4%"
    },
    {
      name: "Netherlands",
      x: "48%",
      y: "26%",
      width: "1.5%",
      height: "2%"
    },
    {
      name: "Spain",
      x: "45%",
      y: "36%",
      width: "4%",
      height: "4%"
    }
  ]

  return (
    <>
      <div className="w-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-4 relative overflow-hidden z-10">
        {/* World Map Background */}
        <div className="relative w-full h-96">
          <div 
            className="w-full h-full rounded-lg bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'%3E%3Cdefs%3E%3Cpattern id='grid' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 50 0 L 0 0 0 50' fill='none' stroke='%23e2e8f0' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
            }}
          />
          
          {/* Country Overlays */}
          {countries.map((country) => {
            const countryData = getCountryData(country.name)
            const countryProjects = getCountryProjects(country.name)
            const isHovered = hoveredCountry === country.name
            
            return (
              <div key={country.name} className="absolute">
                {/* Clickable Area */}
                <div
                  className={`absolute cursor-pointer transition-all duration-200 ${
                    isHovered ? 'bg-blue-200 bg-opacity-30' : 'bg-transparent hover:bg-blue-100 hover:bg-opacity-20'
                  }`}
                  style={{
                    left: country.x,
                    top: country.y,
                    width: country.width,
                    height: country.height,
                  }}
                  onClick={() => handleCountryClick(country.name)}
                  onMouseEnter={() => setHoveredCountry(country.name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  title={`${country.name} - ${countryProjects.length} projects`}
                />
                
                {/* Project Indicator */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `calc(${country.x} + ${parseFloat(country.width) / 2}%)`,
                    top: `calc(${country.y} + ${parseFloat(country.height) / 2}%)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Performance Ring */}
                  <div
                    className={`w-8 h-8 rounded-full border-3 border-white shadow-lg transition-all duration-200 ${
                      isHovered ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                      backgroundColor: countryData?.color || "#94a3b8",
                    }}
                  />
                  
                  {/* Project Count */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {countryProjects.length}
                    </span>
                  </div>
                  
                  {/* Country Label on Hover */}
                  {isHovered && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {country.name}
                      <div className="text-xs opacity-75">
                        {countryProjects.length} project{countryProjects.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium mb-2">Performance:</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Great (85%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Excellent (90%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Good (75%+)</span>
              </div>
            </div>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="font-medium text-sm">Click on a country to view projects</h3>
            <p className="text-xs text-muted-foreground">Numbers show active project count</p>
          </div>
        </div>
      </div>

      {/* Country Projects Modal */}
      <Dialog open={showCountryModal} onOpenChange={setShowCountryModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedCountry} Projects
            </DialogTitle>
            <DialogDescription>
              Projects and performance overview for {selectedCountry}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCountry && (
            <div className="space-y-6">
              {/* Country Stats */}
              {(() => {
                const countryData = getCountryData(selectedCountry)
                if (!countryData) return null
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold">{countryData.projectsOnTime}%</div>
                      <div className="text-xs text-muted-foreground">On Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{countryData.avgITTResponse}d</div>
                      <div className="text-xs text-muted-foreground">Avg ITT Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{countryData.supplierQuality}★</div>
                      <div className="text-xs text-muted-foreground">Supplier Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{countryData.budgetUsage}%</div>
                      <div className="text-xs text-muted-foreground">Budget Usage</div>
                    </div>
                  </div>
                )
              })()}
              
              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {getCountryProjects(selectedCountry).map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleProjectClick(project)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{project.image}</div>
                          <div>
                            <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
                            <CardDescription className="text-sm">{project.location}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getScoreColor(project.score)}`}>
                            {project.score}/100
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Progress</span>
                          <Badge className={getStatusColor(project.status)} variant="secondary">
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Users2 className="h-3 w-3 text-muted-foreground" />
                          <span>{project.team.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{project.suppliers}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Due: {project.deadline}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{project.satisfaction}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Project Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProject?.image}
              {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.location} • Due {selectedProject?.deadline}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Project Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedProject.score)}`}>
                      {selectedProject.score}/100
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedProject.progress}%</div>
                    <Progress value={selectedProject.progress} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStatusColor(selectedProject.status)} variant="secondary">
                      {selectedProject.status}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                      <div className="text-lg font-bold">£{(selectedProject.budget / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Spent</div>
                      <div className="text-lg font-bold">£{(selectedProject.spent / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="text-lg font-bold">£{((selectedProject.budget - selectedProject.spent) / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                  <Progress value={(selectedProject.spent / selectedProject.budget) * 100} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{Math.round((selectedProject.spent / selectedProject.budget) * 100)}% spent</span>
                    <span>{Math.round(((selectedProject.budget - selectedProject.spent) / selectedProject.budget) * 100)}% remaining</span>
                  </div>
                </CardContent>
              </Card>

              {/* Team and Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Team & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Team Members</span>
                      <span className="font-medium">{selectedProject.team.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Suppliers</span>
                      <span className="font-medium">{selectedProject.suppliers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project Size</span>
                      <span className="font-medium">{selectedProject.size}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Issues & Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Issues Reported</span>
                      </div>
                      <span className="font-medium">{selectedProject.issuesReported}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Rework Cost</span>
                      </div>
                      <span className="font-medium">£{(selectedProject.reworkCost / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">Satisfaction</span>
                      </div>
                      <span className="font-medium">{selectedProject.satisfaction}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1">
                  Open Project Dashboard
                </Button>
                <Button variant="outline">
                  View Documents
                </Button>
                <Button variant="outline">
                  Contact Team
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowProjectModal(false)
                    setShowCountryModal(true)
                  }}
                >
                  Back to {selectedProject.country}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}