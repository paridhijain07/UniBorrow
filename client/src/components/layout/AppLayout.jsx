import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

