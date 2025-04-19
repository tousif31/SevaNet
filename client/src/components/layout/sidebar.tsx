import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { MapPin, Home, CircleAlert, PlusCircle, Map, ListChecks, Shield, Settings, LogOut, User, Award } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className={cn("hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen", className)}>
      <div className="p-4 flex items-center">
        <span className="text-blue-500 text-2xl mr-2">
          <MapPin size={24} />
        </span>
        <h1 className="text-xl font-semibold">Report-It</h1>
      </div>
      
      <nav className="mt-8 px-4 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menu</h2>
        <ul>
          <li>
            <Link href="/" className={cn(
              "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
              isActive("/") ? "bg-blue-50" : "hover:bg-gray-100"
            )}>
              <Home className={cn("mr-3", isActive("/") ? "text-blue-500" : "text-gray-500")} size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/my-reports" className={cn(
              "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
              isActive("/my-reports") ? "bg-blue-50" : "hover:bg-gray-100"
            )}>
              <CircleAlert className={cn("mr-3", isActive("/my-reports") ? "text-blue-500" : "text-gray-500")} size={18} />
              <span>My Reports</span>
            </Link>
          </li>
          <li>
            <Link href="/report-issue" className={cn(
              "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
              isActive("/report-issue") ? "bg-blue-50" : "hover:bg-gray-100"
            )}>
              <PlusCircle className={cn("mr-3", isActive("/report-issue") ? "text-blue-500" : "text-gray-500")} size={18} />
              <span>New Report</span>
            </Link>
          </li>

          {user?.role !== "admin" && (
            <li>
              <Link href="/profile" className={cn(
                "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
                isActive("/profile") ? "bg-blue-50" : "hover:bg-gray-100"
              )}>
                <Award className={cn("mr-3", isActive("/profile") ? "text-blue-500" : "text-gray-500")} size={18} />
                <span>My Achievements</span>
              </Link>
            </li>
          )}
        </ul>
        
        {user?.role === "admin" && (
          <>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-3">Admin</h2>
            <ul>
              <li>
                <Link href="/admin" className={cn(
                  "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
                  isActive("/admin") ? "bg-blue-50" : "hover:bg-gray-100"
                )}>
                  <ListChecks className={cn("mr-3", isActive("/admin") ? "text-blue-500" : "text-gray-500")} size={18} />
                  <span>All Reports</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className={cn(
                  "flex items-center px-3 py-2 text-gray-700 rounded-md mb-1",
                  isActive("/admin/settings") ? "bg-blue-50" : "hover:bg-gray-100"
                )}>
                  <Settings className={cn("mr-3", isActive("/admin/settings") ? "text-blue-500" : "text-gray-500")} size={18} />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <span>{user?.name?.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center px-3 py-2 text-sm text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          <LogOut size={16} className="mr-2" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
