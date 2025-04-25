
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";

export default function MarketManagement() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const { data: listings } = useQuery({
    queryKey: ["market-listings"],
    queryFn: async () => {
      const response = await fetch("/api/market/listings");
      return response.json();
    }
  });

  const columns = [
    {
      header: "Product",
      accessorKey: "name",
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Price",
      accessorKey: "price",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header
          title="Market Management"
          onSidebarToggle={() => setMobileSidebarOpen(true)}
        />
        
        <div className="px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-800">Manage Listings</h1>
              <p className="text-neutral-500">View and manage marketplace listings</p>
            </div>
            
            <Button className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Listing</span>
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={listings || []}
          />
        </div>
      </main>
    </div>
  );
}
