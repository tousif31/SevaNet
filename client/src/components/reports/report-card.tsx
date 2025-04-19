import { formatDate } from "@/lib/utils";
import { Report } from "@shared/schema";
import { TrafficCone, Trash2, Lightbulb, Droplet, AlertCircle } from "lucide-react";
import { ReportStatusBadge } from "./report-status-badge";
import { Link } from "wouter";
import { categoriesDisplay } from "@shared/schema";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const getCategoryIcon = () => {
    switch (report.category) {
      case 'road-damage':
        return <TrafficCone className="text-gray-500" size={20} />;
      case 'garbage':
        return <Trash2 className="text-gray-500" size={20} />;
      case 'street-light':
        return <Lightbulb className="text-gray-500" size={20} />;
      case 'water-sewage':
        return <Droplet className="text-gray-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
          {getCategoryIcon()}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
              <p className="text-xs text-gray-500">
                {report.address}, {report.neighborhood}
              </p>
            </div>
            <ReportStatusBadge status={report.status} />
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {formatDate(report.createdAt)}
            </span>
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {categoriesDisplay[report.category as keyof typeof categoriesDisplay] || report.category}
            </span>
          </div>
          
          <div className="mt-3">
            <Link href={`/reports/${report.id}`}>
              <a className="text-sm text-blue-600 hover:text-blue-800">
                View details
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
