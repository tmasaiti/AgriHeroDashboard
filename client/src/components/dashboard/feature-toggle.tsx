import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Globe, Clock } from "lucide-react";

interface FeatureToggleProps {
  name: string;
  description: string;
  enabled: boolean;
  scope: string;
  regions?: string[];
  lastUpdated: Date;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function FeatureToggle({
  name,
  description,
  enabled,
  scope,
  regions = [],
  lastUpdated,
  onToggle,
  className,
}: FeatureToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "today";
    } else if (diffInDays === 1) {
      return "yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  const getScopeBadge = () => {
    switch (scope) {
      case "global":
        return (
          <div className="flex items-center mr-3">
            <Globe className="h-3 w-3 mr-1" />
            <span>Global</span>
          </div>
        );
      case "region":
        return regions.map((region, index) => (
          <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 mr-2">
            {region}
          </Badge>
        ));
      case "beta":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Beta Users
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const handleToggleChange = (checked: boolean) => {
    setIsEnabled(checked);
    onToggle(checked);
  };
  
  return (
    <div className={cn("border-b border-neutral-100 pb-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-neutral-800 mb-1">{name}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggleChange}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle {name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex mt-3 text-xs text-neutral-500">
        <span className="flex items-center mr-3">
          {getScopeBadge()}
        </span>
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Updated {formatTimeAgo(lastUpdated)}
        </span>
      </div>
    </div>
  );
}
