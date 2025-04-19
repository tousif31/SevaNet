import { cn } from "@/lib/utils";
import { statusDisplay } from "@shared/schema";

interface ReportStatusBadgeProps {
  status: string;
  className?: string;
}

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={cn(
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full border",
      getStatusClasses(),
      className
    )}>
      {statusDisplay[status as keyof typeof statusDisplay] || status}
    </span>
  );
}
