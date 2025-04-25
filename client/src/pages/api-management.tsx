
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe,
  Settings,
  Key,
  Clock,
  Activity,
  RefreshCw,
  Save
} from "lucide-react";

export default function APIManagement() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    rateLimit: "1000",
    timeout: "30",
    caching: true,
    versioning: true
  });

  // Authentication
  const [authSettings, setAuthSettings] = useState({
    apiKeyRequired: true,
    oauthEnabled: false,
    keyExpiry: "90",
    keyPrefix: "agri_"
  });

  // Monitoring
  const [monitoringSettings, setMonitoringSettings] = useState({
    errorTracking: true,
    performanceMonitoring: true,
    alertThreshold: "95"
  });

  const saveAPIMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/api-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save API settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API settings saved",
        description: "Your API settings have been updated successfully.",
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

  const handleSaveAPI = () => {
    saveAPIMutation.mutate({
      settings: apiSettings,
      authentication: authSettings,
      monitoring: monitoringSettings
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
          title="API Management" 
          onSidebarToggle={() => setMobileSidebarOpen(true)} 
        />
        
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">API Settings</h1>
              <p className="text-neutral-500">Manage API configuration and monitoring</p>
            </div>
            
            <Button 
              className="flex items-center space-x-2"
              onClick={handleSaveAPI}
              disabled={saveAPIMutation.isPending}
            >
              {saveAPIMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                General Settings
              </TabsTrigger>
              <TabsTrigger value="auth">
                <Key className="h-4 w-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Configure general API settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rate Limit (requests/hour)</Label>
                    <Input
                      type="number"
                      value={apiSettings.rateLimit}
                      onChange={(e) => 
                        setApiSettings(prev => ({...prev, rateLimit: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={apiSettings.timeout}
                      onChange={(e) => 
                        setApiSettings(prev => ({...prev, timeout: e.target.value}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>API Caching</Label>
                      <div className="text-sm text-neutral-500">
                        Enable response caching
                      </div>
                    </div>
                    <Switch
                      checked={apiSettings.caching}
                      onCheckedChange={(checked) => 
                        setApiSettings(prev => ({...prev, caching: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>API Versioning</Label>
                      <div className="text-sm text-neutral-500">
                        Enable version control
                      </div>
                    </div>
                    <Switch
                      checked={apiSettings.versioning}
                      onCheckedChange={(checked) => 
                        setApiSettings(prev => ({...prev, versioning: checked}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Authentication</CardTitle>
                  <CardDescription>Configure API authentication methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>API Key Authentication</Label>
                      <div className="text-sm text-neutral-500">
                        Require API key for access
                      </div>
                    </div>
                    <Switch
                      checked={authSettings.apiKeyRequired}
                      onCheckedChange={(checked) => 
                        setAuthSettings(prev => ({...prev, apiKeyRequired: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>OAuth 2.0</Label>
                      <div className="text-sm text-neutral-500">
                        Enable OAuth authentication
                      </div>
                    </div>
                    <Switch
                      checked={authSettings.oauthEnabled}
                      onCheckedChange={(checked) => 
                        setAuthSettings(prev => ({...prev, oauthEnabled: checked}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key Expiry (days)</Label>
                    <Input
                      type="number"
                      value={authSettings.keyExpiry}
                      onChange={(e) => 
                        setAuthSettings(prev => ({...prev, keyExpiry: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key Prefix</Label>
                    <Input
                      type="text"
                      value={authSettings.keyPrefix}
                      onChange={(e) => 
                        setAuthSettings(prev => ({...prev, keyPrefix: e.target.value}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Monitoring</CardTitle>
                  <CardDescription>Configure API monitoring and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Error Tracking</Label>
                      <div className="text-sm text-neutral-500">
                        Track and log API errors
                      </div>
                    </div>
                    <Switch
                      checked={monitoringSettings.errorTracking}
                      onCheckedChange={(checked) => 
                        setMonitoringSettings(prev => ({...prev, errorTracking: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Performance Monitoring</Label>
                      <div className="text-sm text-neutral-500">
                        Monitor API performance metrics
                      </div>
                    </div>
                    <Switch
                      checked={monitoringSettings.performanceMonitoring}
                      onCheckedChange={(checked) => 
                        setMonitoringSettings(prev => ({...prev, performanceMonitoring: checked}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Threshold (%)</Label>
                    <Input
                      type="number"
                      value={monitoringSettings.alertThreshold}
                      onChange={(e) => 
                        setMonitoringSettings(prev => ({...prev, alertThreshold: e.target.value}))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Status</CardTitle>
                  <CardDescription>Current API performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-100 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        <span>Average Response Time:</span>
                        <span className="text-green-600">124ms</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-neutral-100 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <Activity className="h-4 w-4" />
                        <span>Success Rate:</span>
                        <span className="text-green-600">99.9%</span>
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
