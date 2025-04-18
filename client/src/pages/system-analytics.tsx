import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  DownloadCloud, 
  BarChart3, 
  ArrowUpRight, 
  Users, 
  FileText,
  Flag,
  HeartPulse,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { SystemMetric } from "@shared/schema";

// Sample data - in a real application, you would fetch this data from the API
const userTrendData = [
  { name: "Jan", users: 8000, newUsers: 3400 },
  { name: "Feb", users: 9000, newUsers: 3700 },
  { name: "Mar", users: 9500, newUsers: 3900 },
  { name: "Apr", users: 10000, newUsers: 4100 },
  { name: "May", users: 10500, newUsers: 4300 },
  { name: "Jun", users: 11000, newUsers: 4500 },
  { name: "Jul", users: 11800, newUsers: 4800 },
  { name: "Aug", users: 12493, newUsers: 5000 },
];

const contentCreationData = [
  { name: "Jan", marketplace: 450, guides: 350, chats: 200 },
  { name: "Feb", marketplace: 470, guides: 380, chats: 220 },
  { name: "Mar", marketplace: 500, guides: 400, chats: 250 },
  { name: "Apr", marketplace: 550, guides: 420, chats: 280 },
  { name: "May", marketplace: 580, guides: 450, chats: 310 },
  { name: "Jun", marketplace: 620, guides: 490, chats: 350 },
  { name: "Jul", marketplace: 680, guides: 520, chats: 380 },
  { name: "Aug", marketplace: 720, guides: 560, chats: 410 },
];

const regionDistributionData = [
  { name: "Africa", value: 6500 },
  { name: "Asia", value: 3200 },
  { name: "Europe", value: 1800 },
  { name: "North America", value: 900 },
  { name: "South America", value: 600 },
];

const systemHealthData = [
  { name: "API Latency", value: 125, threshold: 100 },
  { name: "Error Rate", value: 3.2, threshold: 5 },
  { name: "CPU Usage", value: 65, threshold: 80 },
  { name: "Memory Usage", value: 72, threshold: 80 },
  { name: "Disk Space", value: 48, threshold: 90 },
];

const COLORS = ['#0078D4', '#107C10', '#FFB900', '#D83B01', '#5C2D91'];

export default function SystemAnalytics() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetric[]>({
    queryKey: ["/api/metrics"],
  });
  
  // Get formatted metric data for display
  const getMetricByName = (name: string) => {
    if (metricsLoading || !metrics) return { value: "0", type: "neutral" };
    const metric = metrics.find(m => m.name === name);
    return metric ? { value: metric.value, type: "neutral" } : { value: "0", type: "neutral" };
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="System Analytics" 
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
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">System Analytics</h1>
              <p className="text-neutral-500">Monitor system performance and user activity</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{date ? date.toLocaleDateString() : "Select date"}</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <DownloadCloud className="h-4 w-4" />
                <span>Export</span>
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
          
          <Tabs 
            defaultValue="overview" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="system">System Health</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">User Growth</CardTitle>
                        <CardDescription>Active and new users over time</CardDescription>
                      </div>
                      <Select defaultValue="month">
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={userTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#0078D4"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="newUsers"
                            stroke="#107C10"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Content Creation Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Content Creation</CardTitle>
                        <CardDescription>New content items by type</CardDescription>
                      </div>
                      <Select defaultValue="month">
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={contentCreationData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="marketplace" stackId="a" fill="#0078D4" />
                          <Bar dataKey="guides" stackId="a" fill="#107C10" />
                          <Bar dataKey="chats" stackId="a" fill="#FFB900" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Distribution */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Distribution</CardTitle>
                    <CardDescription>Users by geographic region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={regionDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {regionDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {regionDistributionData.map((region, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm">{region.name}</span>
                          </div>
                          <span className="text-sm font-medium">{region.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* System Health Metrics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">System Health Metrics</CardTitle>
                    <CardDescription>Current performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={systemHealthData}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="value" 
                            fill="#0078D4" 
                            radius={[0, 4, 4, 0]}
                            label={{ position: 'right', formatter: (v: number) => `${v}` }}
                          />
                          <Bar 
                            dataKey="threshold" 
                            fill="#D83B01" 
                            radius={[0, 4, 4, 0]}
                            opacity={0.3}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>User Growth Trends</CardTitle>
                    <CardDescription>Monthly active users over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={userTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#0078D4"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="newUsers"
                            stroke="#107C10"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">User Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Farmers</span>
                          <span className="font-medium">8,745</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Vendors</span>
                          <span className="font-medium">2,218</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Agronomists</span>
                          <span className="font-medium">1,120</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '9%' }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Admins</span>
                          <span className="font-medium">410</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '3%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Active Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Active", value: 9500 },
                                { name: "Inactive", value: 2200 },
                                { name: "Suspended", value: 793 },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                            >
                              <Cell fill="#107C10" />
                              <Cell fill="#767676" />
                              <Cell fill="#D83B01" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                            <span>Active (76%)</span>
                          </div>
                          <span className="font-medium">9,500</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-neutral-500 mr-2"></div>
                            <span>Inactive (18%)</span>
                          </div>
                          <span className="font-medium">2,200</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                            <span>Suspended (6%)</span>
                          </div>
                          <span className="font-medium">793</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Creation Trends</CardTitle>
                    <CardDescription>New content items by type and month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={contentCreationData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="marketplace" name="Marketplace" fill="#0078D4" />
                          <Bar dataKey="guides" name="Guides" fill="#107C10" />
                          <Bar dataKey="chats" name="Chats" fill="#FFB900" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Total content items by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Marketplace", value: 1820 },
                              { name: "Guides", value: 1420 },
                              { name: "Chats", value: 481 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#0078D4" />
                            <Cell fill="#107C10" />
                            <Cell fill="#FFB900" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Content Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Approved</span>
                          <span className="text-sm font-medium">3,241</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Pending</span>
                          <span className="text-sm font-medium">452</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Rejected</span>
                          <span className="text-sm font-medium">28</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '1%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Content</span>
                        <span className="text-sm font-medium">3,721</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Flag className="h-5 w-5 mr-2 text-red-500" />
                      Reported Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Misleading Information</span>
                          <span className="text-sm font-medium">14</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Inappropriate Content</span>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Spam</span>
                          <span className="text-sm font-medium">6</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Reported</span>
                        <span className="text-sm font-medium">28</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Regional Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Kenya</span>
                          <span className="text-sm font-medium">1,482</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Nigeria</span>
                          <span className="text-sm font-medium">856</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Other African Countries</span>
                          <span className="text-sm font-medium">745</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Rest of World</span>
                          <span className="text-sm font-medium">638</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '17%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Content</span>
                        <span className="text-sm font-medium">3,721</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health Indicators</CardTitle>
                    <CardDescription>Current system performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={systemHealthData}
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={90} />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            name="Current Value" 
                            dataKey="value" 
                            fill="#0078D4" 
                            radius={[0, 4, 4, 0]}
                            label={{ position: 'right', formatter: (v: number) => `${v}` }}
                          />
                          <Bar 
                            name="Threshold" 
                            dataKey="threshold" 
                            fill="#D83B01" 
                            radius={[0, 4, 4, 0]}
                            opacity={0.4}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>API Performance</CardTitle>
                    <CardDescription>Response times and error rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: "00:00", latency: 90, errors: 2 },
                            { name: "04:00", latency: 85, errors: 1 },
                            { name: "08:00", latency: 110, errors: 3 },
                            { name: "12:00", latency: 130, errors: 4 },
                            { name: "16:00", latency: 125, errors: 3 },
                            { name: "20:00", latency: 100, errors: 2 },
                            { name: "Now", latency: 95, errors: 2 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="latency"
                            name="API Latency (ms)"
                            stroke="#0078D4"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="errors"
                            name="Error Rate (%)"
                            stroke="#D83B01"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-neutral-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-primary"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - 0.65)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-semibold">65%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm text-neutral-500">Healthy</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-neutral-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-primary"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - 0.72)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-semibold">72%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm text-neutral-500">Healthy</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Disk Space</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-neutral-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-green-500"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - 0.48)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-semibold">48%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm text-neutral-500">Plenty of space</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-neutral-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-amber-500"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - 0.78)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-semibold">78%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm text-neutral-500">Check soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Events</CardTitle>
                  <CardDescription>Recent system notifications and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
                        <span className="text-sm">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">API Latency Spike Detected</p>
                        <p className="text-xs text-neutral-500">API response times increased by 12% in the last hour.</p>
                        <p className="text-xs text-neutral-400 mt-1">Today, 10:45 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Database Backup Completed</p>
                        <p className="text-xs text-neutral-500">Daily database backup completed successfully.</p>
                        <p className="text-xs text-neutral-400 mt-1">Today, 02:30 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                        <X className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Error Rate Threshold Reached</p>
                        <p className="text-xs text-neutral-500">API endpoint /api/crops/forecast is returning 503 errors.</p>
                        <p className="text-xs text-neutral-400 mt-1">Yesterday, 11:23 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Traffic Spike Detected</p>
                        <p className="text-xs text-neutral-500">Unusual traffic spike from Kenya region detected. Auto-scaling initiated.</p>
                        <p className="text-xs text-neutral-400 mt-1">Yesterday, 09:15 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Hidden Date Picker */}
      <div className="hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
    </div>
  );
}
