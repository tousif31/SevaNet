import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ReportForm } from "@/components/reports/report-form";

export default function ReportIssue() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Report an Issue</h1>
              <p className="text-gray-600 mt-1">Submit a new civic issue for attention</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Issue Details</h2>
              </div>
              
              <div className="p-6">
                <ReportForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
