
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
  Shield, 
  Key, 
  Lock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Save
} from "lucide-react";

export default function Security() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Access Control
  const [accessLevels, setAccessLevels] = useState({
    admin: true,
    manager: true,
    analyst: false
  });

  // Authentication Settings
  const [authSettings, setAuthSettings] = useState({
    mfaRequired: true,
    passwordExpiry: "90",
    loginAttempts: "3",
    sessionTimeout: "30"
  });

  // Security Policies
  const [securityPolicies, setSecurityPolicies] = useState({
    ipWhitelisting: true,
    auditLogging: true,
    encryptionLevel: "high"
  });

  const saveSecurityMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/security/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save security settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Security settings saved",
        description: "Your security settings have been updated successfully.",
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

  const handleSaveSecurity = () => {
    saveSecurityMutation.mutate({
      accessControl: accessLevels,
      authentication: authSettings,
      policies: securityPolicies
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
          title="Security Management" 
          onSidebarToggle={() => setMobileSidebarOpen(true)} 
        />
        
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Security Settings</h1>
              <p className="text-neutral-500">Manage security and access control settings</p>
            </div>
            
            <Button 
              className="flex items-center space-x-2"
              onClick={handleSaveSecurity}
              disabled={saveSecurityMutation.isPending}
            >
              {saveSecurityMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>

          <Tabs defaultValue="access" className="space-y-6">
            <TabsList>
              <TabsTrigger value="access">
                <UserCheck className="h-4 w-4 mr-2" />
                Access Control
              </TabsTrigger>
              <TabsTrigger value="auth">
                <Key className="h-4 w-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="policies">
                <Shield className="h-4 w-4 mr-2" />
                Security Policies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Access Levels</CardTitle>
                  <CardDescription>Configure role-based access control</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Administrator Access</Label>
                      <div className="text-sm text-neutral-500">
                        Full system access and configuration
                      </div>
                    </div>
                    <Switch
                      checked={accessLevels.admin}
                      onCheckedChange={(checked) => 
                        setAccessLevels(prev => ({...prev, admin: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Manager Access</Label>
                      <div className="text-sm text-neutral-500">
                        Manage users and content
                      </div>
                    </div>
                    <Switch
                      checked={accessLevels.manager}
                      onCheckedChange={(checked) => 
                        setAccessLevels(prev => ({...prev, manager: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Analyst Access</Label>
                      <div className="text-sm text-neutral-500">
                        View and analyze data
                      </div>
                    </div>
                    <Switch
                      checked={accessLevels.analyst}
                      onCheckedChange={(checked) => 
                        setAccessLevels(prev => ({...prev, analyst: checked}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Settings</CardTitle>
                  <CardDescription>Configure authentication and session management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Multi-Factor Authentication</Label>
                      <div className="text-sm text-neutral-500">
                        Require MFA for all users
                      </div>
                    </div>
                    <Switch
                      checked={authSettings.mfaRequired}
                      onCheckedChange={(checked) => 
                        setAuthSettings(prev => ({...prev, mfaRequired: checked}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Input
                      type="number"
                      value={authSettings.passwordExpiry}
                      onChange={(e) => 
                        setAuthSettings(prev => ({...prev, passwordExpiry: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Login Attempts</Label>
                    <Input
                      type="number"
                      value={authSettings.loginAttempts}
                      onChange={(e) => 
                        setAuthSettings(prev => ({...prev, loginAttempts: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={authSettings.sessionTimeout}
                      onChange={(e) => 
                        setAuthSettings(prev => ({...prev, sessionTimeout: e.target.value}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Policies</CardTitle>
                  <CardDescription>Configure system-wide security policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>IP Whitelisting</Label>
                      <div className="text-sm text-neutral-500">
                        Restrict access to specific IP addresses
                      </div>
                    </div>
                    <Switch
                      checked={securityPolicies.ipWhitelisting}
                      onCheckedChange={(checked) => 
                        setSecurityPolicies(prev => ({...prev, ipWhitelisting: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Audit Logging</Label>
                      <div className="text-sm text-neutral-500">
                        Log all security-related events
                      </div>
                    </div>
                    <Switch
                      checked={securityPolicies.auditLogging}
                      onCheckedChange={(checked) => 
                        setSecurityPolicies(prev => ({...prev, auditLogging: checked}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Encryption Level</Label>
                    <Select 
                      value={securityPolicies.encryptionLevel}
                      onValueChange={(value) => 
                        setSecurityPolicies(prev => ({...prev, encryptionLevel: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basic (128-bit)</SelectItem>
                        <SelectItem value="medium">Standard (256-bit)</SelectItem>
                        <SelectItem value="high">Military Grade (512-bit)</SelectItem>
                      </SelectContent>
                    </Select>
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
