import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

const AdminDashboard = lazy(() => import("./pages/admin-view/dashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin-view/products.jsx"));
const AdminOrders = lazy(() => import("./pages/admin-view/orders.jsx"));

const Home = lazy(() => import("./pages/Home.jsx"));
const Browse = lazy(() => import("./pages/Browse.jsx"));
const ItemDetail = lazy(() => import("./pages/ItemDetail.jsx"));
const AddItem = lazy(() => import("./pages/AddItem.jsx"));
const EditItem = lazy(() => import("./pages/EditItem.jsx"));
const Bookings = lazy(() => import("./pages/Bookings.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-orange-200 dark:border-orange-950/60 border-t-[#f97316] rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/item/:id" element={<ItemDetail />} />

          <Route element={<PrivateRoute />}>
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:userId" element={<ChatPage />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>

          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;

