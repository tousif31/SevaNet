import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { MapPin, Menu, Bell, Search, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu & logo */}
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700 focus:outline-none mr-3"
            onClick={onMobileMenuToggle}
          >
            <Menu size={20} />
          </Button>
          <span className="text-blue-500 text-xl mr-2">
            <MapPin size={24} />
          </span>
          <h1 className="font-semibold">Report-It</h1>
        </div>
        
        {/* Search bar */}
        <div className={cn(
          "hidden md:flex items-center flex-1 max-w-xl ml-8 transition-all duration-200", 
          isSearchFocused ? "scale-105" : ""
        )}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="Search reports..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
        
        {/* User menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Bell size={20} />
          </Button>
          <div className="hidden md:flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <span>{user?.name?.substring(0, 2).toUpperCase()}</span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
