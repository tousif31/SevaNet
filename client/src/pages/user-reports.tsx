import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriesDisplay } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function UserReports() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
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
  
  // Filter reports
  const filteredReports = reports.filter((report: { title: string; description: string; status: string; category: string; }) => {
    // Filter by search query
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && report.status !== statusFilter) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter !== "all" && report.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Get unique categories from reports
  const categories = Array.from(new Set(reports.map((report: { category: string }) => report.category))) as string[];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className={isMobileMenuOpen ? "block" : "hidden md:flex"} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
                <p className="text-gray-600 mt-1">View and track all your reported issues</p>
              </div>
              <Link href="/report-issue">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Report New Issue</span>
                </Button>
              </Link>
            </div>
            
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search reports..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {(categoriesDisplay[category as keyof typeof categoriesDisplay] || category) as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Reports table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All My Reports</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report: { id: Key | null | undefined; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; address: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; neighborhood: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; category: string; createdAt: string | Date; status: string; }) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <div>{report.address}</div>
                            <div className="text-gray-500 text-sm">{report.neighborhood}</div>
                          </TableCell>
                          <TableCell>
                            {categoriesDisplay[report.category as keyof typeof categoriesDisplay] || report.category}
                          </TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <ReportStatusBadge status={report.status} />
                          </TableCell>
                          <TableCell>
                            <Link href={`/reports/${report.id}`}>
                              <a className="text-blue-600 hover:text-blue-900">View</a>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">You haven't submitted any reports yet.</p>
                  <Link href="/report-issue">
                    <Button>Report an Issue</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {filteredReports.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
