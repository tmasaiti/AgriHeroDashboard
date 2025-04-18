import React from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  onSidebarToggle: () => void;
}

export function Header({ title, onSidebarToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger onClick={onSidebarToggle} />
          <h2 className="font-semibold text-lg ml-4">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative text-neutral-600 hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">3</span>
            </Button>
          </div>
          
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 text-neutral-600 p-1">
                  <span className="text-sm">EN</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>French</DropdownMenuItem>
                <DropdownMenuItem>Spanish</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-neutral-100">
                  <span className="text-xs font-medium">
                    {user?.fullName?.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.fullName}</span>
                    <span className="text-xs text-neutral-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SystemAlert({ message, type = "warning", onClose }: { 
  message: string; 
  type?: "warning" | "info" | "error" | "success"; 
  onClose?: () => void;
}) {
  const alertClasses = {
    warning: "bg-warning/10 border-warning text-warning",
    info: "bg-blue-500/10 border-blue-500 text-blue-500",
    error: "bg-red-500/10 border-red-500 text-red-500",
    success: "bg-green-500/10 border-green-500 text-green-500"
  };
  
  const iconMap = {
    warning: <Bell className="h-4 w-4" />,
    info: <Bell className="h-4 w-4" />,
    error: <Bell className="h-4 w-4" />,
    success: <Bell className="h-4 w-4" />
  };
  
  return (
    <div className={`border-l-4 px-6 py-2 ${alertClasses[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {iconMap[type]}
          <span className="text-sm font-medium">{message}</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-neutral-500 hover:text-neutral-700 p-1 h-auto">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
