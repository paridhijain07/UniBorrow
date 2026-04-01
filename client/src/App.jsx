import { Route, Routes } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import Bookings from "./pages/Bookings.jsx";
import ChatList from "./pages/ChatList.jsx";
import ChatThread from "./pages/ChatThread.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  return (
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
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:userId" element={<ChatThread />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="/profile/:id" element={<Profile />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;

