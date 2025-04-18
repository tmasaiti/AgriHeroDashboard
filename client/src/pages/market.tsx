import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter, 
  Download, 
  MoreHorizontal, 
  ArrowDown,
  ArrowUp, 
  Plus,
  FileText, 
  Edit, 
  Trash2,
  Calendar,
  Search,
  Clock
} from "lucide-react";

// Type definitions for market data
interface ProducePrice {
  id: number;
  produceName: string;
  category: string;
  price: number;
  previousPrice: number;
  change: number;
  percentChange: number;
  region: string;
  date: string;
  source: string;
  status: "rising" | "falling" | "stable";
}

// Sample data - in a real application, this would come from an API
const sampleProducePrices: ProducePrice[] = [
  { 
    id: 1, 
    produceName: "Maize", 
    category: "Grain",
    price: 32.50, 
    previousPrice: 30.20, 
    change: 2.30, 
    percentChange: 7.62, 
    region: "East Africa", 
    date: "2025-04-16", 
    source: "Regional Market Index",
    status: "rising" 
  },
  { 
    id: 2, 
    produceName: "Tomatoes", 
    category: "Vegetable",
    price: 45.75, 
    previousPrice: 48.20, 
    change: -2.45, 
    percentChange: -5.08, 
    region: "West Africa", 
    date: "2025-04-16", 
    source: "National Market Survey",
    status: "falling" 
  },
  { 
    id: 3, 
    produceName: "Coffee Beans", 
    category: "Cash Crop",
    price: 425.00, 
    previousPrice: 412.70, 
    change: 12.30, 
    percentChange: 2.98, 
    region: "East Africa", 
    date: "2025-04-16", 
    source: "Global Commodity Index",
    status: "rising" 
  },
  { 
    id: 4, 
    produceName: "Rice", 
    category: "Grain",
    price: 54.25, 
    previousPrice: 54.20, 
    change: 0.05, 
    percentChange: 0.09, 
    region: "West Africa", 
    date: "2025-04-16", 
    source: "Regional Market Index",
    status: "stable" 
  },
  { 
    id: 5, 
    produceName: "Potatoes", 
    category: "Root Vegetable",
    price: 28.35, 
    previousPrice: 30.50, 
    change: -2.15, 
    percentChange: -7.05, 
    region: "East Africa", 
    date: "2025-04-16", 
    source: "National Market Survey",
    status: "falling" 
  },
  { 
    id: 6, 
    produceName: "Cassava", 
    category: "Root Vegetable",
    price: 18.40, 
    previousPrice: 17.80, 
    change: 0.60, 
    percentChange: 3.37, 
    region: "West Africa", 
    date: "2025-04-16", 
    source: "Local Market Reports",
    status: "rising" 
  },
  { 
    id: 7, 
    produceName: "Cocoa", 
    category: "Cash Crop",
    price: 380.15, 
    previousPrice: 372.50, 
    change: 7.65, 
    percentChange: 2.05, 
    region: "West Africa", 
    date: "2025-04-16", 
    source: "Global Commodity Index",
    status: "rising" 
  },
  { 
    id: 8, 
    produceName: "Bananas", 
    category: "Fruit",
    price: 21.75, 
    previousPrice: 22.50, 
    change: -0.75, 
    percentChange: -3.33, 
    region: "East Africa", 
    date: "2025-04-16", 
    source: "Regional Market Index",
    status: "falling" 
  },
  { 
    id: 9, 
    produceName: "Sorghum", 
    category: "Grain",
    price: 26.90, 
    previousPrice: 26.85, 
    change: 0.05, 
    percentChange: 0.19, 
    region: "East Africa", 
    date: "2025-04-16", 
    source: "National Market Survey",
    status: "stable" 
  },
  { 
    id: 10, 
    produceName: "Sweet Potatoes", 
    category: "Root Vegetable",
    price: 19.50, 
    previousPrice: 18.75, 
    change: 0.75, 
    percentChange: 4.00, 
    region: "West Africa", 
    date: "2025-04-16", 
    source: "Local Market Reports",
    status: "rising" 
  }
];

// For market-specific categories
const produceCategories = [
  "All Categories",
  "Grain",
  "Vegetable",
  "Root Vegetable",
  "Fruit",
  "Cash Crop",
];

const regions = [
  "All Regions",
  "East Africa",
  "West Africa",
  "South Africa",
  "North Africa",
  "Central Africa",
];

export default function Market() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProducePrice | '';
    direction: 'ascending' | 'descending' | '';
  }>({ key: '', direction: '' });
  const [addProduceDialog, setAddProduceDialog] = useState(false);
  const [editProduceId, setEditProduceId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ProducePrice>>({
    produceName: '',
    category: '',
    price: 0,
    previousPrice: 0,
    region: '',
    source: '',
  });

  // Fetch produce prices data from API
  const { data: producePrices, isLoading, isError } = useQuery<ProducePrice[]>({
    queryKey: ['/api/produce-markets'],
  });
  
  // Create mutation for adding new produce market
  const createMutation = useMutation({
    mutationFn: async (data: Partial<ProducePrice>) => {
      const res = await apiRequest('POST', '/api/produce-markets', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Produce price added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produce-markets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add produce price: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update mutation for editing produce market
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ProducePrice> }) => {
      const res = await apiRequest('PUT', `/api/produce-markets/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Produce price updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produce-markets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update produce price: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation for removing produce market
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/produce-markets/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Produce price deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produce-markets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete produce price: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filtered and sorted data
  const filteredData = producePrices ? producePrices.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.produceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Categories" || 
      item.category === selectedCategory;
    
    const matchesRegion = selectedRegion === "All Regions" || 
      item.region === selectedRegion;
    
    return matchesSearch && matchesCategory && matchesRegion;
  }) : [];

  // Handle sorting
  const requestSort = (key: keyof ProducePrice) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
    const key = sortConfig.key;
    if (a[key] < b[key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Handle dialog open for adding/editing
  const openAddDialog = () => {
    setEditProduceId(null);
    setFormData({
      produceName: '',
      category: '',
      price: 0,
      previousPrice: 0,
      region: '',
      source: '',
    });
    setAddProduceDialog(true);
  };

  const openEditDialog = (produce: ProducePrice) => {
    setEditProduceId(produce.id);
    setFormData({
      produceName: produce.produceName,
      category: produce.category,
      price: produce.price,
      previousPrice: produce.previousPrice,
      region: produce.region,
      source: produce.source,
    });
    setAddProduceDialog(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'previousPrice' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add/edit submit
  const handleSubmit = () => {
    setAddProduceDialog(false);
    
    // Calculate change and percentChange
    const price = formData.price || 0;
    const previousPrice = formData.previousPrice || 0;
    const change = price - previousPrice;
    const percentChange = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    
    // Determine status based on price change
    let status: 'rising' | 'falling' | 'stable' = 'stable';
    if (change > 0) status = 'rising';
    else if (change < 0) status = 'falling';
    
    // Add computed fields to form data
    const submitData = {
      ...formData,
      change,
      percentChange,
      status,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };
    
    if (editProduceId) {
      // Update existing record
      updateMutation.mutate({ id: editProduceId, data: submitData });
    } else {
      // Create new record
      createMutation.mutate(submitData);
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this produce price entry?')) {
      deleteMutation.mutate(id);
    }
  };

  // Format price display
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Format percent change display
  const formatPercentChange = (change: number) => {
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // Get icon and color class based on status
  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'rising':
        return { 
          icon: <TrendingUp className="h-4 w-4" />, 
          colorClass: 'text-green-600' 
        };
      case 'falling':
        return { 
          icon: <TrendingDown className="h-4 w-4" />, 
          colorClass: 'text-red-600' 
        };
      default:
        return { 
          icon: null, 
          colorClass: 'text-neutral-600' 
        };
    }
  };

  // Export data function
  const exportData = () => {
    // In a real application, this would generate a CSV or Excel file
    const csvContent = 
      "Produce,Category,Price,Previous Price,Change,% Change,Region,Date,Source\n" +
      sortedData.map(item => 
        `"${item.produceName}","${item.category}","${item.price}","${item.previousPrice}","${item.change}","${item.percentChange}","${item.region}","${item.date}","${item.source}"`
      ).join("\n");

    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produce_prices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get sort direction indicator
  const getSortIndicator = (key: keyof ProducePrice) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <Header 
          title="Market - Produce Prices" 
          onSidebarToggle={() => setMobileSidebarOpen(true)} 
        />
        
        <div className="px-6 py-6">
          {/* Header with actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">Produce Price Index</h1>
              <p className="text-neutral-500">Monitor and manage agricultural produce prices</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={openAddDialog} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Price</span>
              </Button>
              
              <Button variant="outline" onClick={exportData} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search produce..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {produceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedRegion} 
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Regions</SelectLabel>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Prices table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Produce Prices</CardTitle>
                  <CardDescription>Last updated: April 16, 2025</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">
                    {sortedData.length} items
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => requestSort('produceName')} className="cursor-pointer">
                        <div className="flex items-center">
                          Produce
                          {getSortIndicator('produceName')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('category')} className="cursor-pointer">
                        <div className="flex items-center">
                          Category
                          {getSortIndicator('category')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('price')} className="cursor-pointer">
                        <div className="flex items-center">
                          Price
                          {getSortIndicator('price')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('previousPrice')} className="cursor-pointer">
                        <div className="flex items-center">
                          Previous
                          {getSortIndicator('previousPrice')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('percentChange')} className="cursor-pointer text-right">
                        <div className="flex items-center justify-end">
                          Change
                          {getSortIndicator('percentChange')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('region')} className="cursor-pointer">
                        <div className="flex items-center">
                          Region
                          {getSortIndicator('region')}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => requestSort('date')} className="cursor-pointer">
                        <div className="flex items-center">
                          Date
                          {getSortIndicator('date')}
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading produce prices...
                        </TableCell>
                      </TableRow>
                    ) : sortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No produce prices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedData.map((produce) => {
                        const { icon, colorClass } = getStatusDetails(produce.status);
                        return (
                          <TableRow key={produce.id}>
                            <TableCell className="font-medium">
                              {produce.produceName}
                            </TableCell>
                            <TableCell>{produce.category}</TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(produce.price)}
                            </TableCell>
                            <TableCell>
                              {formatPrice(produce.previousPrice)}
                            </TableCell>
                            <TableCell className={`text-right ${colorClass}`}>
                              <div className="flex items-center justify-end space-x-1">
                                <span>{formatPercentChange(produce.percentChange)}</span>
                                {icon}
                              </div>
                            </TableCell>
                            <TableCell>{produce.region}</TableCell>
                            <TableCell>{produce.date}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openEditDialog(produce)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(produce.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => console.log('View history')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Price history</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={addProduceDialog} onOpenChange={setAddProduceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editProduceId ? 'Edit Produce Price' : 'Add New Produce Price'}</DialogTitle>
            <DialogDescription>
              {editProduceId 
                ? 'Update the price information for this produce item.' 
                : 'Enter details for the new produce price listing.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="produceName">Produce Name</Label>
              <Input
                id="produceName"
                name="produceName"
                value={formData.produceName}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {produceCategories.filter(c => c !== "All Categories").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => handleSelectChange('region', value)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter(r => r !== "All Regions").map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Current Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={formData.price}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="previousPrice">Previous Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="previousPrice"
                    name="previousPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={formData.previousPrice}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProduceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editProduceId ? 'Update' : 'Add'} Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}