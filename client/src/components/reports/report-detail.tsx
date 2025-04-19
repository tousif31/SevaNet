import { formatDate, formatDateTime } from "@/lib/utils";
import { categoriesDisplay, reportStatuses, statusDisplay } from "@shared/schema";
import { TrafficCone, Trash2, Lightbulb, Droplet, AlertCircle, ArrowLeft, Check, Clock, User, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ReportStatusBadge } from "./report-status-badge";
import { Map } from "../ui/map";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { Link } from "wouter";

interface ReportDetailProps {
  reportId: string;
}

export function ReportDetail({ reportId }: ReportDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [assignment, setAssignment] = useState("");
  
  // Fetch report
  const { data: report, isLoading } = useQuery({
    queryKey: [`/api/reports/${reportId}`],
    queryFn: async () => {
      const res = await fetch(`/api/reports/${reportId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });
  
  // Fetch updates
  const { data: updates = [] } = useQuery({
    queryKey: [`/api/reports/${reportId}/updates`],
    queryFn: async () => {
      const res = await fetch(`/api/reports/${reportId}/updates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch updates");
      return res.json();
    },
    enabled: !!reportId,
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/reports/${reportId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/updates`] });
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
  
  // Assign report mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/reports/${reportId}/assign`, { assignedTo: assignment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/updates`] });
      toast({
        title: "Report assigned",
        description: "The report has been assigned successfully.",
      });
      setAssignment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/reports/${reportId}/updates`, { content: comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/updates`] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      setComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };
  
  const handleAssignReport = () => {
    if (assignment) {
      assignMutation.mutate();
    }
  };
  
  const handleAddComment = () => {
    if (comment.trim()) {
      addCommentMutation.mutate();
    }
  };
  
  const getCategoryIcon = () => {
    if (!report) return <AlertCircle className="text-blue-500 text-xl" />;
    
    switch (report.category) {
      case 'road-damage':
        return <TrafficCone className="text-blue-500" size={24} />;
      case 'garbage':
        return <Trash2 className="text-blue-500" size={24} />;
      case 'street-light':
        return <Lightbulb className="text-blue-500" size={24} />;
      case 'water-sewage':
        return <Droplet className="text-blue-500" size={24} />;
      default:
        return <AlertCircle className="text-blue-500" size={24} />;
    }
  };
  
  if (isLoading || !report) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <Link href={user?.role === "admin" ? "/admin" : "/my-reports"}>
          <a className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </a>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{report.title}</h1>
          <p className="text-gray-600 mt-1">Reported on {formatDate(report.createdAt)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left column - Report details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Issue Details</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center">
                  {getCategoryIcon()}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">
                    {categoriesDisplay[report.category as keyof typeof categoriesDisplay] || report.category}
                  </p>
                </div>
                <div className="ml-auto">
                  <ReportStatusBadge status={report.status} />
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {report.description}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {report.address}, {report.neighborhood}
                </p>
                
                <Map 
                  latitude={report.latitude}
                  longitude={report.longitude}
                  height="240px"
                />
              </div>
              
              {report.photos && report.photos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {report.photos.map((photo: string, index: number) => (
                      <div key={index} className="h-40 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={photo} 
                          alt={`Issue photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Updates</h2>
            </div>
            
            <div className="p-6">
              {user?.role === "admin" && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add Comment</h4>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Add a comment or update..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={!comment.trim() || addCommentMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {updates.map((update: any, idx: number) => (
                    <li key={update.id}>
                      <div className="relative pb-8">
                        {idx !== updates.length - 1 ? (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <User className="text-white" size={16} />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {update.userId === report.userId ? "User" : "Admin"}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">{formatDateTime(update.createdAt)}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <p>{update.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Status and actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Current Status</div>
                {user?.role === "admin" ? (
                  <Select
                    defaultValue={report.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusDisplay[status as keyof typeof statusDisplay]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-500' :
                      report.status === 'in-progress' ? 'bg-blue-100 text-blue-500' :
                      report.status === 'assigned' ? 'bg-indigo-100 text-indigo-500' :
                      'bg-green-100 text-green-500'
                    }`}>
                      {report.status === 'pending' ? <Clock size={20} /> :
                       report.status === 'in-progress' ? <RefreshCw size={20} /> :
                       report.status === 'assigned' ? <User size={20} /> :
                       <Check size={20} />}
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-gray-900">
                        {statusDisplay[report.status as keyof typeof statusDisplay]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {report.status === 'pending' ? 'Awaiting review' :
                         report.status === 'in-progress' ? 'Work in progress' :
                         report.status === 'assigned' ? 'Assigned to department' :
                         'Issue resolved'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Assigned To</div>
                {user?.role === "admin" ? (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter department or assignee"
                      value={assignment}
                      onChange={(e) => setAssignment(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAssignReport}
                      disabled={!assignment || assignMutation.isPending}
                    >
                      Assign
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {report.assignedTo || "Not yet assigned"}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Timeline</div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check size={12} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      report.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {report.status !== 'pending' ? <Check size={12} /> : <span>2</span>}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Reviewed</p>
                      <p className="text-xs text-gray-500">
                        {report.status !== 'pending' ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      report.status === 'in-progress' || report.status === 'assigned' || report.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {report.status === 'in-progress' || report.status === 'assigned' || report.status === 'completed' ? <Check size={12} /> : <span>3</span>}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">In Progress</p>
                      <p className="text-xs text-gray-500">
                        {report.status === 'in-progress' || report.status === 'assigned' || report.status === 'completed' ? 'Active' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      report.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {report.status === 'completed' ? <Check size={12} /> : <span>4</span>}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Completed</p>
                      <p className="text-xs text-gray-500">
                        {report.status === 'completed' ? 'Resolved' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
