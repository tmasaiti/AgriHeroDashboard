import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart,
  Users,
  FileText,
  Flag,
  HeartPulse,
  LucideIcon
} from "lucide-react";

const statsCardVariants = cva(
  "bg-white p-6 rounded-lg shadow-sm border border-neutral-100",
  {
    variants: {
      type: {
        users: "bg-white",
        content: "bg-white",
        moderation: "bg-white",
        health: "bg-white",
      },
    },
    defaultVariants: {
      type: "users",
    },
  }
);

interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: "users" | "content" | "moderation" | "health" | LucideIcon;
  className?: string;
  updatedText?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon = "users",
  type,
  className,
  updatedText,
}: StatsCardProps) {
  const iconMap = {
    users: Users,
    content: FileText,
    moderation: Flag,
    health: HeartPulse,
    chart: BarChart,
  };
  
  const backgroundColorMap = {
    users: "bg-primary/10 text-primary",
    content: "bg-amber-500/10 text-amber-500",
    moderation: "bg-red-500/10 text-red-500",
    health: "bg-green-500/10 text-green-500",
  };
  
  const changeColorMap = {
    increase: "text-green-500",
    decrease: "text-red-500",
    neutral: "text-neutral-500",
  };
  
  const IconComponent = typeof icon === "string" ? iconMap[icon as keyof typeof iconMap] : icon;
  
  return (
    <div className={cn(statsCardVariants({ type }), className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-sm mb-1">{title}</p>
          <h3 className="font-semibold text-2xl">{value}</h3>
          {change && (
            <p className={cn("text-sm mt-1 flex items-center", changeColorMap[change.type])}>
              {change.type === "increase" ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : change.type === "decrease" ? (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              ) : null}
              {change.value} {change.period ? `from ${change.period}` : ""}
            </p>
          )}
          {updatedText && (
            <p className="text-neutral-500 text-sm mt-1 flex items-center">
              <span className="inline-block w-3 h-3 mr-1 rounded-full border border-neutral-300"></span>
              {updatedText}
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", backgroundColorMap[type || "users"])}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
