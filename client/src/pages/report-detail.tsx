import { useState } from "react";
import { useParams } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ReportDetail as ReportDetailComponent } from "@/components/reports/report-detail";

export default function ReportDetail() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const params = useParams<{ id: string }>();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className={isMobileMenuOpen ? "block" : "hidden md:flex"} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto">
          <ReportDetailComponent reportId={params.id} />
        </main>
      </div>
    </div>
  );
}
