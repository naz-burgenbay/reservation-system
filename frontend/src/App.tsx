
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReservationsPage from "./pages/MyReservationsPage";
import BuildingsPage from "./pages/BuildingsPage";
import RoomsPage from "./pages/RoomsPage";
import CreateBuildingPage from "./pages/CreateBuildingPage";
import EditBuildingPage from "./pages/EditBuildingPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import EditRoomPage from "./pages/EditRoomPage";
import Navbar from "./components/Navbar";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/buildings" element={<ProtectedLayout><BuildingsPage /></ProtectedLayout>} />
          <Route path="/buildings/create" element={<ProtectedLayout><CreateBuildingPage /></ProtectedLayout>} />
          <Route path="/buildings/:id" element={<ProtectedLayout><div>Building Detail</div></ProtectedLayout>} />
          <Route path="/buildings/:id/edit" element={<ProtectedLayout><EditBuildingPage /></ProtectedLayout>} />
          <Route path="/rooms" element={<ProtectedLayout><RoomsPage /></ProtectedLayout>} />
          <Route path="/rooms/create" element={<ProtectedLayout><CreateRoomPage /></ProtectedLayout>} />
          <Route path="/rooms/:id" element={<ProtectedLayout><div>Room Detail</div></ProtectedLayout>} />
          <Route path="/rooms/:id/edit" element={<ProtectedLayout><EditRoomPage /></ProtectedLayout>} />
          <Route path="/reservations" element={<ProtectedLayout><MyReservationsPage /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/reservations" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}