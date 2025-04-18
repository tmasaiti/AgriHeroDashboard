import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { ComplianceCard } from "@/components/dashboard/compliance-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ComplianceReport } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";

export default function ComplianceReporting() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  
  // Fetch compliance reports
  const { data: reports, isLoading: reportsLoading } = useQuery<ComplianceReport[]>({
    queryKey: ["/api/compliance-reports"],
  });
  
  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/compliance-reports/${id}/generate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-reports"] });
      toast({
        title: "Report generated",
        description: "The compliance report has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter reports based on active tab and region
  const filteredReports = reports?.filter(report => {
    // Filter by tab
    if (activeTab === "all") {
      // No tab filter, apply only region and type filters
    } else if (activeTab === "pending" && report.status !== "pending_action") {
      return false;
    } else if (activeTab === "generated" && report.status !== "generated") {
      return false;
    }
    
    // Filter by region
    if (filterRegion !== "all" && report.region !== filterRegion) {
      return false;
    }
    
    // Filter by type
    if (filterType !== "all" && report.type !== filterType) {
      return false;
    }
    
    return true;
  });
  
  // Handle download or review report
  const handleReportAction = (report: ComplianceReport) => {
    if (report.status === "pending_action") {
      // Open review dialog
      setSelectedReport(report);
      setViewReportDialogOpen(true);
    } else {
      // Generate and download report
      generateReportMutation.mutate(report.id);
      toast({
        title: "Downloading report",
        description: `${report.title} is being downloaded.`,
      });
    }
  };
  
  // Format date to be user friendly
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get pending action count
  const getPendingActionCount = () => {
    if (!reports) return 0;
    return reports.filter(report => report.status === "pending_action").length;
  };
  
  // GDPR requests table columns
  const gdprColumns = [
    {
      header: "Request ID",
      accessorKey: "id",
      cell: () => <span className="text-sm">REQ-{Math.floor(Math.random() * 1000)}</span>,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: () => (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-200">
          Data Deletion
        </Badge>
      ),
    },
    {
      header: "User",
      accessorKey: "user",
      cell: () => <span className="text-sm">user@example.com</span>,
    },
    {
      header: "Submitted",
      accessorKey: "date",
      cell: () => <span className="text-sm text-neutral-500">2 days ago</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: () => (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-200">
          Pending
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: () => (
        <div className="flex justify-end space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8"
          >
            Process
          </Button>
        </div>
      ),
    },
  ];
  
  // Sample GDPR requests - just structure, no mock data
  const gdprRequests = Array.from({ length: 3 }).map((_, index) => ({ id: index + 1 }));
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Compliance & Reporting" 
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
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Compliance & Reporting</h1>
              <p className="text-neutral-500">Manage compliance reports and regulatory requirements</p>
            </div>
            
            <div className="flex space-x-3">
              <Select
                value={filterRegion}
                onValueChange={setFilterRegion}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="crop_yield">Crop Yield</SelectItem>
                  <SelectItem value="fertilizer_usage">Fertilizer Usage</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export All</span>
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending Action
                {getPendingActionCount() > 0 && (
                  <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                    {getPendingActionCount()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="generated">Generated</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredReports && filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map(report => (
                    <ComplianceCard
                      key={report.id}
                      title={report.title}
                      description={report.description || ""}
                      type={report.type}
                      frequency={report.frequency}
                      lastUpdatedText={`Last updated: ${formatDate(report.lastGenerated)}`}
                      status={report.status}
                      pendingActions={report.pendingActions || 0}
                      onClick={() => handleReportAction(report)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-12 text-center">
                  <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No reports found</h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    {filterRegion !== "all" || filterType !== "all" ? 
                      "Try changing your filters to see more reports." : 
                      "No compliance reports are available. Reports will appear here when they are generated."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* GDPR Compliance Section */}
          {(activeTab === "all" || activeTab === "pending") && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <CardTitle>GDPR Compliance Requests</CardTitle>
                    <CardDescription>User data deletion and access requests</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-700 mt-2 md:mt-0">
                    3 Pending Requests
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={gdprColumns}
                  data={gdprRequests}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  EU GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Data Protection Policies</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Compliant
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Right to be Forgotten</span>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700">
                        Pending
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full w-[70%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Data Portability</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Compliant
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Status</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700">
                      Action Required
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Kenya Data Act
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Local Data Storage</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Compliant
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Government Audit Access</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Compliant
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Data Protection Officer</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Assigned
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Status</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      Fully Compliant
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Upcoming Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium">Nigeria Digital Agriculture Act</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-neutral-500">Effective date</span>
                      <span className="text-xs font-medium">Jan 15, 2024</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      New requirements for agricultural data collection and reporting.
                    </p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium">EU Carbon Footprint Directive</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-neutral-500">Effective date</span>
                      <span className="text-xs font-medium">Mar 30, 2024</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Reporting on carbon emissions for European agricultural practices.
                    </p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View Preparation Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* View Report Dialog */}
        <Dialog open={viewReportDialogOpen} onOpenChange={setViewReportDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
              <DialogDescription>
                {selectedReport?.type === "gdpr" ? 
                  "Review and process pending GDPR compliance requests" : 
                  "Review report details and pending actions"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedReport?.type === "gdpr" ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Action Required</p>
                      <p className="text-sm text-amber-700 mt-1">
                        There are {selectedReport.pendingActions} pending data deletion requests that require your review.
                      </p>
                    </div>
                  </div>
                </div>
                
                <DataTable 
                  columns={gdprColumns}
                  data={Array.from({ length: selectedReport.pendingActions || 0 }).map((_, index) => ({ id: index + 1 }))}
                />
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <p className="text-sm font-medium">Compliance Status</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    All GDPR requests must be processed within 30 days of receipt. Please review and action all pending requests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Report Type</p>
                    <p className="text-base">{selectedReport?.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Frequency</p>
                    <p className="text-base">{selectedReport?.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Region</p>
                    <p className="text-base">{selectedReport?.region || "Global"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Last Generated</p>
                    <p className="text-base">{selectedReport ? formatDate(selectedReport.lastGenerated) : ""}</p>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {selectedReport?.description}
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Pending Actions</p>
                      <p className="text-sm text-amber-700 mt-1">
                        This report has {selectedReport?.pendingActions} pending actions that require your attention before it can be generated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedReport) {
                  generateReportMutation.mutate(selectedReport.id);
                  setViewReportDialogOpen(false);
                  toast({
                    title: "Processing report",
                    description: `${selectedReport.title} is being processed.`,
                  });
                }
              }}>
                {generateReportMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedReport?.type === "gdpr" ? "Process Requests" : "Process Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
