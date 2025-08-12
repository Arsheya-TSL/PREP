"use client"

import { useState } from "react"
import { Button } from "../ui/button"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")

  const sections = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${activeSection === section.id 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                    }
                  `}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            {activeSection === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Profile Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@company.com"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Project Manager</option>
                      <option>Site Supervisor</option>
                      <option>Quantity Surveyor</option>
                      <option>Architect</option>
                    </select>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-800">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-800">Password</h3>
                      <p className="text-sm text-neutral-600">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-800">Email Notifications</h3>
                      <p className="text-sm text-neutral-600">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-800">Push Notifications</h3>
                      <p className="text-sm text-neutral-600">Receive updates in the browser</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-800">Project Updates</h3>
                      <p className="text-sm text-neutral-600">Get notified about project changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Appearance Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Theme</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Sidebar Width</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Expanded</option>
                      <option>Collapsed</option>
                      <option>Hidden</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "integrations" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Integrations</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                      <div>
                        <h3 className="font-medium text-neutral-800">Microsoft Teams</h3>
                        <p className="text-sm text-neutral-600">Connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                      <div>
                        <h3 className="font-medium text-neutral-800">Slack</h3>
                        <p className="text-sm text-neutral-600">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 