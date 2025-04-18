import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header, SystemAlert } from "@/components/dashboard/header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserPlus, Download, Pencil, Trash2, Loader2 } from "lucide-react";

export default function UserManagement() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();
  
  // Query states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // User dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // User form schema
  const userFormSchema = selectedUser
    ? insertUserSchema.partial().omit({ password: true })
    : insertUserSchema.extend({
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
  
  type UserFormValues = z.infer<typeof userFormSchema>;
  
  // Initialize form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: selectedUser ? {
      username: selectedUser.username,
      email: selectedUser.email,
      fullName: selectedUser.fullName,
      role: selectedUser.role,
      region: selectedUser.region,
      status: selectedUser.status,
    } : {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      role: "farmer",
      region: "global",
      status: "active",
    },
  });
  
  // Reset form when selected user changes
  useState(() => {
    if (selectedUser) {
      form.reset({
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        role: selectedUser.role,
        region: selectedUser.region,
        status: selectedUser.status,
      });
    } else {
      form.reset({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        fullName: "",
        role: "farmer",
        region: "global",
        status: "active",
      });
    }
  });
  
  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.append("role", roleFilter);
    if (regionFilter !== "all") params.append("region", regionFilter);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (searchQuery) params.append("search", searchQuery);
    return params.toString();
  };
  
  // Fetch users with filters
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", roleFilter, regionFilter, statusFilter, searchQuery],
    queryFn: async () => {
      const queryString = buildQueryString();
      const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(endpoint, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User created",
        description: "User has been successfully created",
      });
      setUserDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number, userData: Partial<UserFormValues> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "User has been successfully updated",
      });
      setUserDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted",
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    if (selectedUser) {
      const { confirmPassword, ...userData } = data;
      updateUserMutation.mutate({ id: selectedUser.id, userData });
    } else {
      createUserMutation.mutate(data);
    }
  };
  
  // Handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      region: user.region,
      status: user.status,
    });
    setUserDialogOpen(true);
  };
  
  // Handle deleting a user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
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
      header: "Username",
      accessorKey: "username" as keyof User,
      cell: (user: User) => (
        <span className="text-sm text-neutral-600">{user.username}</span>
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-neutral-400 hover:text-primary"
            onClick={() => handleEditUser(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-neutral-400 hover:text-red-500"
            onClick={() => handleDeleteUser(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
  
  // Filter options
  const roleOptions = [
    { label: "All Roles", value: "all" },
    { label: "Farmer", value: "farmer" },
    { label: "Vendor", value: "vendor" },
    { label: "Agronomist", value: "agronomist" },
    { label: "Support Agent", value: "support_agent" },
    { label: "Regional Admin", value: "regional_admin" },
    { label: "Super Admin", value: "super_admin" },
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
  
  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
  ];
  
  // Filters for DataTable
  const filters = [
    {
      name: "Role",
      value: roleFilter,
      onChange: (value: string) => setRoleFilter(value),
      options: roleOptions,
    },
    {
      name: "Region",
      value: regionFilter,
      onChange: (value: string) => setRegionFilter(value),
      options: regionOptions,
    },
    {
      name: "Status",
      value: statusFilter,
      onChange: (value: string) => setStatusFilter(value),
      options: statusOptions,
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
          title="User Management" 
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
              <h1 className="font-semibold text-2xl text-neutral-800 mb-1">User Management</h1>
              <p className="text-neutral-500">Manage all users registered in the AgriHero6 platform</p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => {
                  setSelectedUser(null);
                  form.reset({
                    username: "",
                    password: "",
                    confirmPassword: "",
                    email: "",
                    fullName: "",
                    role: "farmer",
                    region: "global",
                    status: "active",
                  });
                  setUserDialogOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </div>
          </div>
          
          <DataTable
            columns={userColumns}
            data={usersLoading ? [] : (users || [])}
            totalItems={users?.length || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            searchPlaceholder="Search users..."
            onSearch={(value) => setSearchQuery(value)}
            filters={filters}
          />
        </div>
        
        {/* User Create/Edit Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit User" : "Create New User"}</DialogTitle>
              <DialogDescription>
                {selectedUser 
                  ? "Update user information in the form below." 
                  : "Fill in the details below to create a new user."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter username" 
                          {...field} 
                          disabled={!!selectedUser}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter email address" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!selectedUser && (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter password" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Confirm password" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="farmer">Farmer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="agronomist">Agronomist</SelectItem>
                            <SelectItem value="support_agent">Support Agent</SelectItem>
                            <SelectItem value="regional_admin">Regional Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="Africa">Africa</SelectItem>
                            <SelectItem value="Asia">Asia</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="South America">South America</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setUserDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  >
                    {(createUserMutation.isPending || updateUserMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {selectedUser ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the user 
                <span className="font-semibold"> {selectedUser?.fullName}</span>. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (selectedUser) {
                    deleteUserMutation.mutate(selectedUser.id);
                  }
                }}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
