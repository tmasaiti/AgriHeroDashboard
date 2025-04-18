import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  FileText,
  History,
  Lock,
  Settings,
  ShieldCheck,
  ToggleLeft,
  User,
  X,
  Menu,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart2,
  LineChart,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isMobileSidebarOpen?: boolean;
  setMobileSidebarOpen?: (isOpen: boolean) => void;
}

export function Sidebar({
  className,
  isMobileSidebarOpen,
  setMobileSidebarOpen,
}: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Get user initials for the avatar
  const getInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const closeMobileSidebar = () => {
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const sidebarClasses = cn(
    "w-64 bg-white shadow-md z-20 flex-shrink-0 h-full transition-all duration-300",
    isMobileSidebarOpen 
      ? "fixed inset-y-0 left-0 transform translate-x-0" 
      : "hidden md:block",
    className
  );

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 className="font-semibold text-lg text-neutral-800">AgriHero6</h1>
        </div>
        {isMobileSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={closeMobileSidebar} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="py-4 h-[calc(100%-8rem)]">
        <div className="px-4 mb-4">
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white">
              <span>{getInitials()}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.fullName || "User"}</p>
              <p className="text-xs text-neutral-500">{user?.role || "Admin"}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-full pb-12">
          <div className="px-4">
            <p className="px-4 text-xs font-medium text-neutral-500 uppercase mb-2">Core</p>
            <nav className="space-y-1">
              <Link href="/">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </a>
              </Link>

              <Link href="/users">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/users" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <User className="h-5 w-5" />
                  <span>User Management</span>
                </a>
              </Link>

              <Link href="/content">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/content" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <FileText className="h-5 w-5" />
                  <span>Content Moderation</span>
                </a>
              </Link>

              <Link href="/analytics">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/analytics" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <BarChart3 className="h-5 w-5" />
                  <span>System Analytics</span>
                </a>
              </Link>

              <Link href="/features">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/features" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <ToggleLeft className="h-5 w-5" />
                  <span>Feature Configuration</span>
                </a>
              </Link>
            </nav>

            <p className="px-4 text-xs font-medium text-neutral-500 uppercase mt-6 mb-2">Market</p>
            <nav className="space-y-1">
              <Link href="/market">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/market" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <TrendingUp className="h-5 w-5" />
                  <span>Produce Prices</span>
                </a>
              </Link>

              <Link href="/market/analytics">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/market/analytics" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <LineChart className="h-5 w-5" />
                  <span>Market Analytics</span>
                </a>
              </Link>

              <Link href="/market/manage">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/market/manage" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Manage Listings</span>
                </a>
              </Link>
            </nav>
            
            <p className="px-4 text-xs font-medium text-neutral-500 uppercase mt-6 mb-2">Advanced</p>
            <nav className="space-y-1">
              <Link href="/compliance">
                <a className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium",
                  location === "/compliance" 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Compliance & Reporting</span>
                </a>
              </Link>

              <a className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary"
              )}>
                <Lock className="h-5 w-5" />
                <span>Security & API</span>
              </a>

              <a className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary"
              )}>
                <History className="h-5 w-5" />
                <span>Audit Logs</span>
              </a>
            </nav>
          </div>
        </ScrollArea>
      </div>

      <div className="absolute bottom-0 w-full border-t border-neutral-100 p-4">
        <a className="flex items-center space-x-3 text-neutral-600 hover:text-primary">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </aside>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  );
}
