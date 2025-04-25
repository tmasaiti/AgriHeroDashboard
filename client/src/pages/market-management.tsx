
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarketManagement() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["market-listings"],
    queryFn: async () => {
      const response = await fetch("/api/market/listings");
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/produce-markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create listing");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["market-listings"]);
      toast({ title: "Success", description: "Listing created successfully" });
      setIsEditDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/produce-markets/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update listing");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["market-listings"]);
      toast({ title: "Success", description: "Listing updated successfully" });
      setIsEditDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/produce-markets/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete listing");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["market-listings"]);
      toast({ title: "Success", description: "Listing deleted successfully" });
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    if (selectedListing) {
      updateMutation.mutate({ ...data, id: selectedListing.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      header: "Product",
      accessorKey: "produceName",
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
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedListing(row.original);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => deleteMutation.mutate(row.original.id)}
          >
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
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2" onClick={() => setSelectedListing(null)}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Listing</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedListing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      name="produceName"
                      placeholder="Product Name"
                      defaultValue={selectedListing?.produceName}
                    />
                  </div>
                  <div>
                    <Input
                      name="category"
                      placeholder="Category"
                      defaultValue={selectedListing?.category}
                    />
                  </div>
                  <div>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      defaultValue={selectedListing?.price}
                    />
                  </div>
                  <Select name="status" defaultValue={selectedListing?.status || "stable"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rising">Rising</SelectItem>
                      <SelectItem value="falling">Falling</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    {selectedListing ? 'Update' : 'Create'} Listing
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
