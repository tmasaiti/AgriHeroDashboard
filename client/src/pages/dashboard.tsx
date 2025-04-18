import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { FeatureToggle } from "@/components/dashboard/feature-toggle";
import { ComplianceCard } from "@/components/dashboard/compliance-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { User, FeatureFlag, ComplianceReport, SystemMetric } from "@shared/schema";

export default function Dashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();
  
  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetric[]>({
    queryKey: ["/api/metrics"],
  });
  
  // Fetch recent users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch feature flags
  const { data: features, isLoading: featuresLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });
  
  // Fetch compliance reports
  const { data: reports, isLoading: reportsLoading } = useQuery<ComplianceReport[]>({
    queryKey: ["/api/compliance-reports"],
  });
  
  // Get formatted metric data for display
  const getMetricByName = (name: string) => {
    if (metricsLoading || !metrics) return { value: "0", type: "neutral" };
    const metric = metrics.find(m => m.name === name);
    return metric ? { value: metric.value, type: "neutral" } : { value: "0", type: "neutral" };
  };
  
  // Handle feature toggle
  const handleFeatureToggle = async (id: number, enabled: boolean) => {
    try {
      await apiRequest("PUT", `/api/feature-flags/${id}`, { enabled });
      toast({
        title: "Feature updated",
        description: `Feature flag has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating feature",
        description: "There was a problem updating the feature flag.",
        variant: "destructive",
      });
    }
  };
  
  // User table columns
  const userColumns = [
    {
      header: "User",
      accessorKey: "fullName" as keyof User,
      cell: (user: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-xs text-neutral-600">
              {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-neutral-800">{user.fullName}</div>
            <div className="text-xs text-neutral-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      accessorKey: "role" as keyof User,
      cell: (user: User) => (
        <span className="text-sm text-neutral-600">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
        </span>
      )
    },
    {
      header: "Region",
      accessorKey: "region" as keyof User,
      cell: (user: User) => (
        <span className="text-sm text-neutral-600">{user.region}</span>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof User,
      cell: (user: User) => {
        const statusClasses = {
          active: "bg-green-500/10 text-green-500",
          pending: "bg-amber-500/10 text-amber-500",
          suspended: "bg-red-500/10 text-red-500"
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[user.status as keyof typeof statusClasses] || ""}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        );
      }
    },
    {
      header: "Last Active",
      accessorKey: "lastActive" as keyof User,
      cell: (user: User) => (
        <span className="text-sm text-neutral-500">
          {new Date(user.lastActive).toLocaleString()}
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof User,
      cell: (user: User) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Super Admin Dashboard" 
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
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Dashboard Overview</h1>
                <p className="text-neutral-500">Welcome back. Here's what's happening with AgriHero6 today.</p>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Active Users"
                value={getMetricByName("Active Users").value}
                change={{ value: "12%", type: "increase", period: "last week" }}
                icon="users"
                type="users"
              />
              
              <StatsCard
                title="Content Items"
                value={getMetricByName("Content Items").value}
                change={{ value: "7%", type: "increase", period: "last week" }}
                icon="content"
                type="content"
              />
              
              <StatsCard
                title="Moderation Queue"
                value={getMetricByName("Moderation Queue").value}
                change={{ value: "23%", type: "increase", period: "yesterday" }}
                icon="moderation"
                type="moderation"
              />
              
              <StatsCard
                title="System Health"
                value={`${getMetricByName("System Health").value}%`}
                updatedText="Updated 5 min ago"
                icon="health"
                type="health"
              />
            </div>
            
            {/* Users Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl">Recent Users</h2>
                <Link href="/users">
                  <a className="text-primary text-sm hover:underline">View All Users</a>
                </Link>
              </div>
              
              <DataTable
                columns={userColumns}
                data={usersLoading ? [] : (users || []).slice(0, 4)}
              />
            </div>
            
            {/* Feature Configuration */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl">Feature Configuration</h2>
                <Link href="/features">
                  <a className="text-primary text-sm hover:underline">View All Features</a>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuresLoading ? (
                    <div className="col-span-2 py-8 text-center text-neutral-500">Loading feature flags...</div>
                  ) : (
                    features && features.map(feature => (
                      <FeatureToggle
                        key={feature.id}
                        name={feature.name}
                        description={feature.description}
                        enabled={feature.enabled}
                        scope={feature.scope}
                        regions={feature.regions}
                        lastUpdated={new Date(feature.lastUpdated)}
                        onToggle={(enabled) => handleFeatureToggle(feature.id, enabled)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Compliance Reporting */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl">Compliance Reports</h2>
                <Link href="/compliance">
                  <a className="text-primary text-sm hover:underline">View All Reports</a>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reportsLoading ? (
                    <div className="col-span-3 py-8 text-center text-neutral-500">Loading compliance reports...</div>
                  ) : (
                    reports && reports.map(report => (
                      <ComplianceCard
                        key={report.id}
                        title={report.title}
                        description={report.description}
                        type={report.type}
                        frequency={report.frequency}
                        lastUpdatedText={`Last updated: ${new Date(report.lastGenerated).toLocaleDateString()}`}
                        status={report.status}
                        pendingActions={report.pendingActions}
                        onClick={() => {
                          toast({
                            title: report.status === "pending_action" ? "Reviewing report" : "Downloading report",
                            description: `${report.title} ${report.status === "pending_action" ? "is being reviewed" : "is being downloaded"}`,
                          });
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
