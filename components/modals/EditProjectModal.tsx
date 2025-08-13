"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Calendar, Clock, MapPin, DollarSign, AlertTriangle, CheckCircle, Users, Building } from "lucide-react"

interface Project {
  id: number
  name: string
  location: string
  progress: number
  status?: string
  startDate?: string
  endDate?: string
  budget?: number
  description?: string
  team?: string[]
  milestones?: Milestone[]
  risks?: Risk[]
}

interface Milestone {
  id: string
  title: string
  date: string
  status: 'completed' | 'in-progress' | 'pending'
  description?: string
}

interface Risk {
  id: string
  title: string
  level: 'low' | 'medium' | 'high'
  description: string
  mitigation?: string
}

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onSave: (project: Project) => void
}

export default function EditProjectModal({ isOpen, onClose, project, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState<Project>({
    id: 0,
    name: '',
    location: '',
    progress: 0,
    status: 'in-progress',
    startDate: '',
    endDate: '',
    budget: 0,
    description: '',
    team: [],
    milestones: [],
    risks: []
  })

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'team' | 'risks'>('details')
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '', description: '' })
  const [newRisk, setNewRisk] = useState<{ title: string; level: 'low' | 'medium' | 'high'; description: string; mitigation: string }>({ 
    title: '', 
    level: 'medium', 
    description: '', 
    mitigation: '' 
  })

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget || 0,
        description: project.description || '',
        team: project.team || [],
        milestones: project.milestones || [
          { id: '1', title: 'Project Kickoff', date: '2024-01-15', status: 'completed', description: 'Initial project setup and team onboarding' },
          { id: '2', title: 'Design Phase Complete', date: '2024-03-30', status: 'completed', description: 'All architectural and engineering designs finalized' },
          { id: '3', title: 'Foundation Complete', date: '2024-06-15', status: 'in-progress', description: 'All foundation work and structural preparation' },
          { id: '4', title: 'Structure Complete', date: '2024-09-30', status: 'pending', description: 'Main building structure and framework' },
          { id: '5', title: 'Final Inspection', date: '2024-12-15', status: 'pending', description: 'Final quality checks and handover' }
        ],
        risks: project.risks || [
          { id: '1', title: 'Weather Delays', level: 'medium', description: 'Potential delays due to adverse weather conditions', mitigation: 'Flexible scheduling and weather monitoring' },
          { id: '2', title: 'Material Shortage', level: 'high', description: 'Steel supply chain disruptions', mitigation: 'Alternative suppliers identified and contracts secured' },
          { id: '3', title: 'Budget Overrun', level: 'low', description: 'Potential cost increases', mitigation: 'Regular budget reviews and contingency planning' }
        ]
      })
    }
  }, [project])

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.date) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        date: newMilestone.date,
        status: 'pending',
        description: newMilestone.description
      }
      setFormData(prev => ({
        ...prev,
        milestones: [...(prev.milestones || []), milestone]
      }))
      setNewMilestone({ title: '', date: '', description: '' })
    }
  }

  const addRisk = () => {
    if (newRisk.title && newRisk.description) {
      const risk: Risk = {
        id: Date.now().toString(),
        title: newRisk.title,
        level: newRisk.level,
        description: newRisk.description,
        mitigation: newRisk.mitigation
      }
      setFormData(prev => ({
        ...prev,
        risks: [...(prev.risks || []), risk]
      }))
      setNewRisk({ title: '', level: 'medium', description: '', mitigation: '' })
    }
  }

  const removeMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.filter(m => m.id !== id) || []
    }))
  }

  const removeRisk = (id: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks?.filter(r => r.id !== id) || []
    }))
  }

  const updateMilestoneStatus = (id: string, status: Milestone['status']) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.map(m => m.id === id ? { ...m, status } : m) || []
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] h-[95vh] max-w-none bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ width: '95vw', height: '95vh', maxWidth: 'none' }}
      >
        <DialogHeader className="pb-4 border-b border-slate-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Building className="w-7 h-7 text-blue-600" />
            Edit Project: {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Navigation Tabs */}
          <div className="w-72 bg-white/50 rounded-lg p-6 mr-8">
            <div className="space-y-3">
              {[
                { id: 'details', label: 'Project Details', icon: Building },
                { id: 'timeline', label: 'Timeline & Milestones', icon: Calendar },
                { id: 'team', label: 'Team & Budget', icon: Users },
                { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full text-left px-6 py-4 rounded-lg transition-all duration-200 flex items-center gap-4 ${
                    activeTab === id 
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                      : 'hover:bg-white/70 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pr-4">
            {activeTab === 'details' && (
              <div className="space-y-8">
                <Card className="bg-white/70 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Building className="w-6 h-6" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-base font-medium text-gray-700 mb-2 block">Project Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-base font-medium text-gray-700 mb-2 block">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="progress" className="text-base font-medium text-gray-700 mb-2 block">Progress (%)</Label>
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate" className="text-base font-medium text-gray-700 mb-2 block">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-base font-medium text-gray-700 mb-2 block">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-base font-medium text-gray-700 mb-2 block">Project Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-24 text-base border-slate-200 focus:border-blue-400"
                        placeholder="Describe the project objectives, scope, and key deliverables..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-8">
                <Card className="bg-white/70 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Calendar className="w-6 h-6" />
                      Project Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {formData.milestones?.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-6 bg-white rounded-lg border border-slate-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                              <Badge className={`${getStatusColor(milestone.status)} border text-xs px-2 py-1`}>
                                {milestone.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <select
                              value={milestone.status}
                              onChange={(e) => updateMilestoneStatus(milestone.id, e.target.value as Milestone['status'])}
                              className="px-3 py-1 text-xs border border-slate-200 rounded-md"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeMilestone(milestone.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add New Milestone */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-800 mb-3">Add New Milestone</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Milestone title"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                            className="h-9 border-blue-200"
                          />
                          <Input
                            type="date"
                            value={newMilestone.date}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                            className="h-9 border-blue-200"
                          />
                          <Button onClick={addMilestone} size="sm" className="h-9">
                            Add Milestone
                          </Button>
                        </div>
                        <Input
                          placeholder="Description (optional)"
                          value={newMilestone.description}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-2 h-9 border-blue-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <Card className="bg-white/70 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Budget & Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="budget" className="text-sm font-medium text-gray-700">Total Budget (£)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        className="h-10 border-slate-200 focus:border-blue-400"
                        placeholder="e.g., 2500000"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Members
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-sm">Project Manager</h5>
                          <p className="text-xs text-gray-600">Sarah Johnson</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-sm">Lead Engineer</h5>
                          <p className="text-xs text-gray-600">Michael Chen</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h5 className="font-medium text-sm">Architect</h5>
                          <p className="text-xs text-gray-600">Emily Rodriguez</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <h5 className="font-medium text-sm">Site Supervisor</h5>
                          <p className="text-xs text-gray-600">David Wilson</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="space-y-6">
                <Card className="bg-white/70 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formData.risks?.map((risk) => (
                        <div key={risk.id} className="p-4 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-gray-800">{risk.title}</h4>
                                <Badge className={`${getRiskColor(risk.level)} border text-xs px-2 py-1`}>
                                  {risk.level} risk
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                              {risk.mitigation && (
                                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                  <strong>Mitigation:</strong> {risk.mitigation}
                                </p>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeRisk(risk.id)}
                              className="ml-4 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add New Risk */}
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-gray-800 mb-3">Add New Risk</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              placeholder="Risk title"
                              value={newRisk.title}
                              onChange={(e) => setNewRisk(prev => ({ ...prev, title: e.target.value }))}
                              className="h-9 border-red-200"
                            />
                            <select
                              value={newRisk.level}
                              onChange={(e) => setNewRisk(prev => ({ ...prev, level: e.target.value as 'low' | 'medium' | 'high' }))}
                              className="h-9 px-3 border border-red-200 rounded-md text-sm"
                            >
                              <option value="low">Low Risk</option>
                              <option value="medium">Medium Risk</option>
                              <option value="high">High Risk</option>
                            </select>
                            <Button onClick={addRisk} size="sm" className="h-9">
                              Add Risk
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Risk description"
                            value={newRisk.description}
                            onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                            className="min-h-16 border-red-200"
                          />
                          <Input
                            placeholder="Mitigation strategy (optional)"
                            value={newRisk.mitigation}
                            onChange={(e) => setNewRisk(prev => ({ ...prev, mitigation: e.target.value }))}
                            className="h-9 border-red-200"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <div className="text-base text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="px-8 py-3 text-base h-12">
              Cancel
            </Button>
            <Button onClick={handleSave} className="px-8 py-3 text-base h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}