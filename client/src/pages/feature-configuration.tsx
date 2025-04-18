import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { FeatureToggle } from "@/components/dashboard/feature-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PlusCircle, 
  RefreshCw, 
  Filter, 
  Globe, 
  Clock, 
  Loader2, 
  History,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FeatureFlag, insertFeatureFlagSchema, AuditLog, User } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Extended feature flag schema for the form
const featureFlagFormSchema = insertFeatureFlagSchema.extend({
  regionsList: z.string().optional(), // For multi-select input as comma-separated string
}).omit({ updatedBy: true });

type FeatureFlagFormValues = z.infer<typeof featureFlagFormSchema>;

export default function FeatureConfiguration() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initialize form with default values
  const form = useForm<FeatureFlagFormValues>({
    resolver: zodResolver(featureFlagFormSchema),
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
      scope: "global",
      regions: [],
      regionsList: "",
    },
  });
  
  // Fetch feature flags
  const { data: features, isLoading: featuresLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });
  
  // Fetch audit logs for feature toggles
  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", { action: "feature_flag_update" }],
    enabled: historyDialogOpen,
  });
  
  // Fetch user data for audit logs
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: historyDialogOpen,
  });
  
  // Create feature flag mutation
  const createFeatureFlagMutation = useMutation({
    mutationFn: async (data: FeatureFlagFormValues) => {
      // Parse regions from comma-separated string if provided
      let regions: string[] = [];
      if (data.scope === "region" && data.regionsList) {
        regions = data.regionsList.split(",").map(r => r.trim());
      }
      
      const { regionsList, ...rest } = data;
      const featureData = { ...rest, regions };
      
      const res = await apiRequest("POST", "/api/feature-flags", featureData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({
        title: "Feature flag created",
        description: "The feature flag has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create feature flag",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update feature flag mutation
  const updateFeatureFlagMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const res = await apiRequest("PUT", `/api/feature-flags/${id}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({
        title: "Feature flag updated",
        description: "The feature flag has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update feature flag",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: FeatureFlagFormValues) => {
    createFeatureFlagMutation.mutate(data);
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (id: number, enabled: boolean) => {
    updateFeatureFlagMutation.mutate({ id, enabled });
  };
  
  // Filter features based on search query and active tab
  const filteredFeatures = features?.filter(feature => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === "" || 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "enabled") return feature.enabled && matchesSearch;
    if (activeTab === "disabled") return !feature.enabled && matchesSearch;
    if (activeTab === "global") return feature.scope === "global" && matchesSearch;
    if (activeTab === "regional") return feature.scope === "region" && matchesSearch;
    if (activeTab === "beta") return feature.scope === "beta" && matchesSearch;
    
    return matchesSearch;
  });
  
  // Get audit logs for a specific feature
  const getFeatureAuditLogs = (featureId: number) => {
    if (logsLoading || !auditLogs) return [];
    
    return auditLogs.filter(log => {
      if (log.metadata && typeof log.metadata === 'object') {
        const metadata = log.metadata as { flagId?: number };
        return metadata.flagId === featureId;
      }
      return false;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  // Get username from user id
  const getUserName = (userId: number | null | undefined) => {
    if (!userId || usersLoading || !users) return "Unknown";
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : "Unknown";
  };
  
  // Watch scope to show/hide regions input
  const selectedScope = form.watch("scope");
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Feature Configuration" 
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
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Feature Configuration</h1>
              <p className="text-neutral-500">Manage feature flags across the AgriHero6 platform</p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => {
                  form.reset({
                    name: "",
                    description: "",
                    enabled: true,
                    scope: "global",
                    regions: [],
                    regionsList: "",
                  });
                  setCreateDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Feature</span>
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">Feature Flags</CardTitle>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search features..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="px-6"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Features</TabsTrigger>
                <TabsTrigger value="enabled">Enabled</TabsTrigger>
                <TabsTrigger value="disabled">Disabled</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="regional">Regional</TabsTrigger>
                <TabsTrigger value="beta">Beta</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <CardContent>
              {featuresLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFeatures && filteredFeatures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFeatures.map(feature => (
                    <FeatureToggle
                      key={feature.id}
                      name={feature.name}
                      description={feature.description}
                      enabled={feature.enabled}
                      scope={feature.scope}
                      regions={feature.regions}
                      lastUpdated={new Date(feature.lastUpdated)}
                      onToggle={(enabled) => handleFeatureToggle(feature.id, enabled)}
                      className="hover:bg-neutral-50 px-4 py-4 rounded-md -mx-4"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  {searchQuery ? (
                    <p>No features found matching "{searchQuery}"</p>
                  ) : (
                    <p>No features found. Create a new feature to get started.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feature Audit History</CardTitle>
              <CardDescription>Recent changes to feature flags</CardDescription>
            </CardHeader>
            <CardContent>
              {featuresLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {features?.slice(0, 5).map(feature => {
                    const date = new Date(feature.lastUpdated);
                    return (
                      <div key={feature.id} className="flex items-start border-b border-neutral-100 pb-4 last:border-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <History className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{feature.name}</p>
                            <Badge variant={feature.enabled ? "default" : "outline"} className="text-xs">
                              {feature.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            Last updated by {getUserName(feature.updatedBy)} at {date.toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="ml-auto"
                          onClick={() => {
                            setSelectedFeature(feature);
                            setHistoryDialogOpen(true);
                          }}
                        >
                          View History
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Create Feature Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Feature Flag</DialogTitle>
              <DialogDescription>
                Add a new feature flag to control functionality across the platform.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feature Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter feature name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use a clear, descriptive name for the feature.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this feature does" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enabled</FormLabel>
                        <FormDescription>
                          Enable or disable this feature flag.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="region">Regional</SelectItem>
                          <SelectItem value="beta">Beta Users</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === "global" && "Feature will be applied globally to all users."}
                        {field.value === "region" && "Feature will be available only in selected regions."}
                        {field.value === "beta" && "Feature will be available only to beta test users."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedScope === "region" && (
                  <FormField
                    control={form.control}
                    name="regionsList"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regions</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter regions (comma separated e.g. Kenya, Nigeria)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Specify regions where this feature should be enabled, separated by commas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createFeatureFlagMutation.isPending}
                  >
                    {createFeatureFlagMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Feature
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Feature History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Feature History</DialogTitle>
              <DialogDescription>
                {selectedFeature && `Change history for ${selectedFeature.name}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedFeature && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={selectedFeature.enabled ? "default" : "outline"} className="mr-2">
                        {selectedFeature.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <div className="flex items-center text-xs text-neutral-500">
                        <Globe className="h-3 w-3 mr-1" />
                        <span>{selectedFeature.scope === "global" ? "Global" : 
                               selectedFeature.scope === "region" ? "Regional" : "Beta Users"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">Last Updated</p>
                    <div className="flex items-center justify-end mt-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{new Date(selectedFeature.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Change History</p>
                  
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFeatureAuditLogs(selectedFeature.id).length > 0 ? (
                        getFeatureAuditLogs(selectedFeature.id).map((log, index) => {
                          const metadata = log.metadata as { 
                            oldEnabled?: boolean; 
                            newEnabled?: boolean;
                          };
                          
                          return (
                            <div key={index} className="border-b border-neutral-100 pb-3 last:border-0">
                              <div className="flex items-start">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                  <History className="h-3 w-3" />
                                </div>
                                <div>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      {getUserName(log.adminId)}
                                    </span>{" "}
                                    {metadata.oldEnabled !== undefined && metadata.newEnabled !== undefined && (
                                      <>
                                        changed status from{" "}
                                        <Badge variant={metadata.oldEnabled ? "default" : "outline"} className="text-xs">
                                          {metadata.oldEnabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                        {" "}to{" "}
                                        <Badge variant={metadata.newEnabled ? "default" : "outline"} className="text-xs">
                                          {metadata.newEnabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-xs text-neutral-500 mt-1">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-neutral-500 text-center py-4">
                          No change history available for this feature.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setHistoryDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
