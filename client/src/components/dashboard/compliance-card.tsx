import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileChartColumn,
  FileText,
  Shield,
  LucideIcon
} from "lucide-react";

interface ComplianceCardProps {
  title: string;
  description: string;
  type: "crop_yield" | "fertilizer_usage" | "gdpr" | string;
  frequency: "weekly" | "monthly" | "quarterly" | string;
  lastUpdatedText: string;
  status?: "generated" | "pending_action";
  pendingActions?: number;
  onClick?: () => void;
  className?: string;
}

export function ComplianceCard({
  title,
  description,
  type,
  frequency,
  lastUpdatedText,
  status = "generated",
  pendingActions = 0,
  onClick,
  className
}: ComplianceCardProps) {
  const iconMap: Record<string, LucideIcon> = {
    crop_yield: FileChartColumn,
    fertilizer_usage: FileText,
    gdpr: Shield
  };
  
  const colorMap: Record<string, string> = {
    crop_yield: "bg-primary/10 text-primary",
    fertilizer_usage: "bg-amber-500/10 text-amber-500",
    gdpr: "bg-green-500/10 text-green-500"
  };
  
  const frequencyTextMap: Record<string, string> = {
    weekly: "Generated Weekly",
    monthly: "Generated Monthly",
    quarterly: "Generated Quarterly"
  };
  
  const Icon = iconMap[type] || FileChartColumn;
  
  return (
    <div className={cn("p-4 border border-neutral-100 rounded-lg hover:border-primary hover:shadow-sm transition-all", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorMap[type] || "bg-primary/10 text-primary")}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="outline" className="text-xs px-2 py-1 bg-neutral-100 font-normal">
          {frequencyTextMap[frequency] || frequency}
        </Badge>
      </div>
      
      <h3 className="font-medium text-neutral-800 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-3">{description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          {status === "pending_action" && pendingActions > 0 ? (
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
              {pendingActions} pending {pendingActions === 1 ? 'request' : 'requests'}
            </Badge>
          ) : (
            lastUpdatedText
          )}
        </span>
        <Button 
          variant="link" 
          onClick={onClick} 
          className="text-primary p-0 h-auto hover:no-underline"
        >
          {status === "pending_action" ? "Review" : "Download"}
        </Button>
      </div>
    </div>
  );
}
