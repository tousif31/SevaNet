import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getReportCountsByStatus } from "@/lib/utils";
import { Link } from "wouter";
import { AlertCircle, Clock, RefreshCw, CheckCircle, Download, Filter } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { categoriesDisplay } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    location: "all"
  });
  
  // Fetch all reports
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
  
  // Update report status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: number, status: string }) => {
      return apiRequest("PATCH", `/api/reports/${reportId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Status updated",
        description: "The report status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Status update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = (reportId: number, status: string) => {
    updateStatusMutation.mutate({ reportId, status });
  };
  
  // Filter reports based on selected filters
  const filteredReports = reports.filter((report: { category: string; status: string; }) => {
    if (filters.category !== "all" && report.category !== filters.category) return false;
    if (filters.status !== "all" && report.status !== filters.status) return false;
    return true;
  });
  
  // Get unique neighborhoods for location filter
  const neighborhoods = Array.from(new Set(reports.map((r: { neighborhood: string; }) => r.neighborhood).filter(Boolean))) as string[];
  
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
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage and track all reported civic issues</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button>
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
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
            
            {/* All reports table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">All Reports</h2>
                <div className="flex flex-wrap gap-4">
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoriesDisplay).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {neighborhoods.map((neighborhood) => (
                        <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report: { id: Key | null | undefined; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; address: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; neighborhood: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; category: string; userId: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; createdAt: string | Date; status: string | undefined; }) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <div>{report.address}</div>
                            <div className="text-gray-500 text-sm">{report.neighborhood}</div>
                          </TableCell>
                          <TableCell>
                            {categoriesDisplay[report.category as keyof typeof categoriesDisplay] || report.category}
                          </TableCell>
                          <TableCell>User ID: {report.userId}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Select
                              defaultValue={report.status}
                              onValueChange={(value) => report.id && handleStatusChange(Number(report.id), value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/reports/${report.id}`}>
                                <a className="text-blue-600 hover:text-blue-900">View</a>
                              </Link>
                              <Link href={`/reports/${report.id}`}>
                                <a className="text-gray-600 hover:text-gray-900">Assign</a>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{reports.length}</span> results
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
