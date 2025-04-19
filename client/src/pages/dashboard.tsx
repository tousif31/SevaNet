import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getReportCountsByStatus, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { PlusCircle, AlertCircle, Clock, RefreshCw, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/ui/map";

export default function Dashboard() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch user's reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });
  
  const counts = getReportCountsByStatus(reports);
  
  // Get recent reports (limit to 3)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Format report data for map
  const mapMarkers = reports.map(report => ({
    lat: report.latitude,
    lng: report.longitude,
    color: report.status === 'pending' ? '#F59E0B' : 
           report.status === 'in-progress' ? '#3B82F6' : 
           report.status === 'assigned' ? '#6366F1' : '#10B981'
  }));
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className={isMobileMenuOpen ? "block" : "hidden md:flex"} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}. Here's an overview of your reported issues.</p>
              </div>
              <Link href="/report-issue">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Report New Issue</span>
                </Button>
              </Link>
            </div>
            
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-500 mr-4">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">{counts.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-semibold text-gray-900">{counts.inProgress + counts.assigned}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-semibold text-gray-900">{counts.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent reports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <Link href="/my-reports">
                  <a className="text-sm text-blue-600 hover:text-blue-800">View all</a>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : recentReports.length > 0 ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentReports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">You haven't submitted any reports yet.</p>
                  <Link href="/report-issue">
                    <Button className="mt-4">Report an Issue</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Map overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Issue Map</h2>
                <p className="text-sm text-gray-600 mt-1">Geographic distribution of reported issues</p>
              </div>
              
              <div className="p-6">
                <Map
                  height="400px"
                  markers={mapMarkers}
                />
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    <span className="text-xs text-gray-700">Pending ({counts.pending})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-xs text-gray-700">In Progress ({counts.inProgress})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                    <span className="text-xs text-gray-700">Assigned ({counts.assigned})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-xs text-gray-700">Completed ({counts.completed})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
