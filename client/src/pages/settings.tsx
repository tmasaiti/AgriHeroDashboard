
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Bell, 
  Database,
  HardDrive,
  Network,
  Mail,
  Key,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();

  // Theme settings
  const [theme, setTheme] = useState("light");
  const [autoTheme, setAutoTheme] = useState(false);

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("medium");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(true);

  // System settings
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [loggingLevel, setLoggingLevel] = useState("info");
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      theme: {
        mode: theme,
        auto: autoTheme,
      },
      security: {
        twoFactorEnabled,
        sessionTimeout,
        passwordPolicy,
      },
      notifications: {
        email: emailNotifications,
        system: systemAlerts,
        market: marketUpdates,
      },
      system: {
        cache: cacheEnabled,
        debug: debugMode,
        loggingLevel,
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="System Settings" 
          onSidebarToggle={() => setMobileSidebarOpen(true)} 
        />
        
        {showAlert && (
          <SystemAlert 
            message="System Status: API Latency: 12% ↑" 
            type="warning" 
            onClose={() => setShowAlert(false)} 
          />
        )}
        
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">System Settings</h1>
              <p className="text-neutral-500">Configure and manage system-wide settings</p>
            </div>
            
            <Button 
              className="flex items-center space-x-2"
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList>
              <TabsTrigger value="appearance">
                <Sun className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="system">
                <HardDrive className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize the appearance of your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Theme Mode</Label>
                      <div className="text-sm text-neutral-500">
                        Choose between light and dark mode
                      </div>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Theme</Label>
                      <div className="text-sm text-neutral-500">
                        Automatically switch theme based on system preferences
                      </div>
                    </div>
                    <Switch
                      checked={autoTheme}
                      onCheckedChange={setAutoTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <div className="text-sm text-neutral-500">
                        Enable 2FA for additional security
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      min="5"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basic</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="high">Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage your notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-neutral-500">
                        Receive important updates via email
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>System Alerts</Label>
                      <div className="text-sm text-neutral-500">
                        Get notified about system status changes
                      </div>
                    </div>
                    <Switch
                      checked={systemAlerts}
                      onCheckedChange={setSystemAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Market Updates</Label>
                      <div className="text-sm text-neutral-500">
                        Receive notifications about market changes
                      </div>
                    </div>
                    <Switch
                      checked={marketUpdates}
                      onCheckedChange={setMarketUpdates}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Advanced system settings and performance options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Cache Management</Label>
                      <div className="text-sm text-neutral-500">
                        Enable system-wide caching
                      </div>
                    </div>
                    <Switch
                      checked={cacheEnabled}
                      onCheckedChange={setCacheEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Debug Mode</Label>
                      <div className="text-sm text-neutral-500">
                        Enable detailed error logging
                      </div>
                    </div>
                    <Switch
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logging Level</Label>
                    <Select value={loggingLevel} onValueChange={setLoggingLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>View system status and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-100 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm font-medium">
                          <Database className="h-4 w-4" />
                          <span>Database Status:</span>
                          <span className="text-green-600">Connected</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-neutral-100 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm font-medium">
                          <Network className="h-4 w-4" />
                          <span>API Status:</span>
                          <span className="text-green-600">Operational</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-neutral-100 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm font-medium">
                          <Mail className="h-4 w-4" />
                          <span>Email Service:</span>
                          <span className="text-green-600">Active</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-neutral-100 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm font-medium">
                          <Key className="h-4 w-4" />
                          <span>SSL Certificate:</span>
                          <span className="text-green-600">Valid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
