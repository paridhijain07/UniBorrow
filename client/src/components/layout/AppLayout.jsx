import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide FAB on Login/Signup and Chat pages
  const hideFAB = ["/login", "/signup"].includes(location.pathname) || location.pathname.startsWith("/chat");
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.08),transparent)] pointer-events-none -z-10" />
      
      <Navbar />
      <main key={location.pathname} className="flex-1 animate-page-fade">
        <Outlet />
      </main>
      <Footer />
      
      {/* Floating Action Button (Quick Add) */}
      {!hideFAB && (
        <button
          onClick={() => navigate("/add-item")}
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-full flex justify-center items-center shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 z-50 group ring-4 ring-orange-500/10 dark:ring-orange-500/20"
          title="List an Item"
        >
          <Plus size={26} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
};

export default AppLayout;

