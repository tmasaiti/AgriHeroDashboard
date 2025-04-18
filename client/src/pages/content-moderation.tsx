import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, Eye, Flag, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Content } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Content moderation schema
const moderationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

type ModerationFormValues = z.infer<typeof moderationSchema>;

export default function ContentModeration() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();
  
  // Query parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportedFilter, setReportedFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Dialog states
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  
  // Form for moderation reasons
  const form = useForm<ModerationFormValues>({
    resolver: zodResolver(moderationSchema),
    defaultValues: {
      status: "approved",
      reason: "",
    },
  });
  
  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.append("type", typeFilter);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (reportedFilter === "true") params.append("reported", "true");
    if (regionFilter !== "all") params.append("region", regionFilter);
    if (searchQuery) params.append("search", searchQuery);
    return params.toString();
  };
  
  // Fetch content with filters
  const { data: contents, isLoading: contentsLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents", typeFilter, statusFilter, reportedFilter, regionFilter, searchQuery],
    queryFn: async () => {
      const queryString = buildQueryString();
      const endpoint = `/api/contents${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(endpoint, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    },
  });
  
  // Moderate content mutation
  const moderateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ModerationFormValues }) => {
      const res = await apiRequest("PUT", `/api/contents/${id}/moderate`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Content moderated",
        description: `Content has been ${form.getValues().status}.`,
      });
      setModerationDialogOpen(false);
      setSelectedContent(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to moderate content",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle submit for moderation
  const onSubmit = (data: ModerationFormValues) => {
    if (selectedContent) {
      moderateContentMutation.mutate({ id: selectedContent.id, data });
    }
  };
  
  // Handle viewing content details
  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setViewDialogOpen(true);
  };
  
  // Handle moderating content
  const handleModerateContent = (content: Content) => {
    setSelectedContent(content);
    form.reset({
      status: "approved",
      reason: "",
    });
    setModerationDialogOpen(true);
  };
  
  // Content table columns
  const contentColumns = [
    {
      header: "Title",
      accessorKey: "title" as keyof Content,
      cell: (content: Content) => (
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm font-medium text-neutral-800">{content.title}</div>
            <div className="text-xs text-neutral-500 max-w-md truncate">
              {content.description}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Type",
      accessorKey: "type" as keyof Content,
      cell: (content: Content) => {
        const typeClasses = {
          marketplace: "bg-blue-500/10 text-blue-500",
          guide: "bg-green-500/10 text-green-500",
          chat: "bg-amber-500/10 text-amber-500"
        };
        return (
          <Badge className={typeClasses[content.type as keyof typeof typeClasses] || "bg-neutral-500/10 text-neutral-500"}>
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </Badge>
        );
      }
    },
    {
      header: "Region",
      accessorKey: "region" as keyof Content,
      cell: (content: Content) => (
        <span className="text-sm text-neutral-600">{content.region || "Global"}</span>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Content,
      cell: (content: Content) => {
        const statusClasses = {
          pending: "bg-amber-500/10 text-amber-500",
          approved: "bg-green-500/10 text-green-500",
          rejected: "bg-red-500/10 text-red-500"
        };
        return (
          <Badge className={statusClasses[content.status as keyof typeof statusClasses] || ""}>
            {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
          </Badge>
        );
      }
    },
    {
      header: "Reported",
      accessorKey: "reported" as keyof Content,
      cell: (content: Content) => (
        <span>
          {content.reported ? (
            <div className="flex items-center text-red-500">
              <Flag className="h-4 w-4 mr-1" />
              <span className="text-sm">Yes</span>
            </div>
          ) : (
            <span className="text-sm text-neutral-500">No</span>
          )}
        </span>
      )
    },
    {
      header: "Date",
      accessorKey: "createdAt" as keyof Content,
      cell: (content: Content) => (
        <span className="text-sm text-neutral-500">
          {new Date(content.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Content,
      cell: (content: Content) => (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-neutral-400 hover:text-primary"
            onClick={() => handleViewContent(content)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {content.status === "pending" && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-neutral-400 hover:text-green-500"
              onClick={() => handleModerateContent(content)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];
  
  // Filter options
  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "Marketplace", value: "marketplace" },
    { label: "Guide", value: "guide" },
    { label: "Chat", value: "chat" },
  ];
  
  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];
  
  const reportedOptions = [
    { label: "All Content", value: "all" },
    { label: "Reported", value: "true" },
    { label: "Not Reported", value: "false" },
  ];
  
  const regionOptions = [
    { label: "All Regions", value: "all" },
    { label: "Global", value: "global" },
    { label: "Africa", value: "Africa" },
    { label: "Asia", value: "Asia" },
    { label: "Europe", value: "Europe" },
    { label: "North America", value: "North America" },
    { label: "South America", value: "South America" },
    { label: "Kenya", value: "Kenya" },
    { label: "Nigeria", value: "Nigeria" },
  ];
  
  // Filters for DataTable
  const filters = [
    {
      name: "Type",
      value: typeFilter,
      onChange: (value: string) => setTypeFilter(value),
      options: typeOptions,
    },
    {
      name: "Status",
      value: statusFilter,
      onChange: (value: string) => setStatusFilter(value),
      options: statusOptions,
    },
    {
      name: "Reported",
      value: reportedFilter,
      onChange: (value: string) => setReportedFilter(value),
      options: reportedOptions,
    },
    {
      name: "Region",
      value: regionFilter,
      onChange: (value: string) => setRegionFilter(value),
      options: regionOptions,
    },
  ];
  
  // Filter content based on active tab
  const getFilteredContents = () => {
    if (!contents) return [];
    
    switch (activeTab) {
      case "pending":
        return contents.filter(content => content.status === "pending");
      case "reported":
        return contents.filter(content => content.reported);
      case "approved":
        return contents.filter(content => content.status === "approved");
      case "rejected":
        return contents.filter(content => content.status === "rejected");
      default:
        return contents;
    }
  };
  
  const filteredContents = getFilteredContents();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Content Moderation" 
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
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Content Moderation</h1>
              <p className="text-neutral-500">Review and moderate content across the AgriHero6 platform</p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
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
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                {contents && contents.filter(c => c.status === "pending").length > 0 && (
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                    {contents.filter(c => c.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reported" className="relative">
                Reported
                {contents && contents.filter(c => c.reported).length > 0 && (
                  <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                    {contents.filter(c => c.reported).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <DataTable
                columns={contentColumns}
                data={contentsLoading ? [] : filteredContents}
                totalItems={filteredContents.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                searchPlaceholder="Search content..."
                onSearch={(value) => setSearchQuery(value)}
                filters={filters}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* View Content Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Content Details</DialogTitle>
            </DialogHeader>
            
            {selectedContent && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Title</h3>
                  <p className="text-base">{selectedContent.title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                  <p className="text-sm">{selectedContent.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Type</h3>
                    <p className="text-sm">{selectedContent.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Region</h3>
                    <p className="text-sm">{selectedContent.region || "Global"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Status</h3>
                    <Badge className={
                      selectedContent.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                      selectedContent.status === "approved" ? "bg-green-500/10 text-green-500" :
                      "bg-red-500/10 text-red-500"
                    }>
                      {selectedContent.status.charAt(0).toUpperCase() + selectedContent.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Created At</h3>
                    <p className="text-sm">{new Date(selectedContent.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedContent.reported && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-red-500 flex items-center">
                      <Flag className="h-4 w-4 mr-1" />
                      Reported Content
                    </h3>
                    <p className="text-sm mt-1">{selectedContent.reportReason || "No specific reason provided"}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              {selectedContent && selectedContent.status === "pending" && (
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleModerateContent(selectedContent);
                  }}
                >
                  Moderate Content
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Moderate Content Dialog */}
        <Dialog open={moderationDialogOpen} onOpenChange={setModerationDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Moderate Content</DialogTitle>
              <DialogDescription>
                Review and approve or reject this content item.
              </DialogDescription>
            </DialogHeader>
            
            {selectedContent && (
              <div className="mb-4">
                <h3 className="text-base font-medium">{selectedContent.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{selectedContent.description}</p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Moderation Action</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={field.value === "approved" ? "default" : "outline"}
                            className={field.value === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
                            onClick={() => form.setValue("status", "approved")}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "rejected" ? "default" : "outline"}
                            className={field.value === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
                            onClick={() => form.setValue("status", "rejected")}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a reason for your decision..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setModerationDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={moderateContentMutation.isPending}
                  >
                    {moderateContentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
