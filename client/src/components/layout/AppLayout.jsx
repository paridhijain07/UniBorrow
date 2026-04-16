import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide FAB on Login/Signup pages
  const hideFAB = ["/login", "/signup"].includes(location.pathname);
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#121212] text-[#0f172a] dark:text-[#e4e4e7] flex flex-col transition-colors duration-300">
      <Navbar />
      <main key={location.pathname} className="flex-1 pt-4 animate-page-fade">
        <Outlet />
      </main>
      <Footer />
      
      {/* Floating Action Button (Quick Add) */}
      {!hideFAB && (
        <button
          onClick={() => navigate("/add-item")}
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-gradient-to-br from-[#f97316] to-[#ea6c0a] text-white rounded-full flex justify-center items-center shadow-lg hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 z-50 group hover:ring-4 ring-orange-500/20"
          title="Quick List Item"
        >
          <Plus size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
};

export default AppLayout;

