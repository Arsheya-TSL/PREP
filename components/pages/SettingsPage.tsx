"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useLayoutState } from "../../hooks/useLayoutState"
import { Button } from "../ui/button"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { mode, setVisibleSize } = useLayoutState()

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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${activeSection === section.id 
                      ? 'bg-primary/10 text-foreground font-medium border border-primary/20' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium text-foreground">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            {activeSection === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@company.com"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20">
                      <option>Project Manager</option>
                      <option>Site Supervisor</option>
                      <option>Quantity Surveyor</option>
                      <option>Architect</option>
                    </select>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  Save Changes
                </Button>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border/50">
                    <div>
                      <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border/50">
                    <div>
                      <h3 className="font-medium text-foreground">Password</h3>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive updates in the browser</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Project Updates</h3>
                      <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Appearance Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Theme</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={resolvedTheme === 'light' || theme === 'light' ? 'default' : 'outline'}
                        className="h-9"
                        onClick={() => setTheme('light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={resolvedTheme === 'dark' || theme === 'dark' ? 'default' : 'outline'}
                        className="h-9"
                        onClick={() => setTheme('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  {/* Sidebar width controls removed per request */}
                </div>
              </div>
            )}

            {activeSection === "integrations" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                      <div>
                        <h3 className="font-medium text-foreground">Microsoft Teams</h3>
                        <p className="text-sm text-muted-foreground">Connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                      <div>
                        <h3 className="font-medium text-foreground">Slack</h3>
                        <p className="text-sm text-muted-foreground">Not connected</p>
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