
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function MarketAnalytics() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  
  const { data: marketData } = useQuery({
    queryKey: ["market-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/market/analytics");
      return response.json();
    }
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Market Analytics" 
          onSidebarToggle={() => setMobileSidebarOpen(true)}
        />
        
        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-800">Market Performance</h1>
            <p className="text-neutral-500">Track market trends and performance metrics</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-neutral-500">Total Volume</h3>
                  <p className="text-2xl font-semibold">₦2.4M</p>
                  <span className="text-xs text-green-500">+12.5% from last week</span>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-neutral-500">Active Listings</h3>
                  <p className="text-2xl font-semibold">1,234</p>
                  <span className="text-xs text-green-500">+5.3% from last week</span>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-neutral-500">Avg. Price</h3>
                  <p className="text-2xl font-semibold">₦4,500</p>
                  <span className="text-xs text-red-500">-2.1% from last week</span>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-neutral-500">Success Rate</h3>
                  <p className="text-2xl font-semibold">94.2%</p>
                  <span className="text-xs text-green-500">+1.2% from last week</span>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
