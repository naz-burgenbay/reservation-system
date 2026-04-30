import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/rooms" element={<ProtectedRoute><div>Rooms</div></ProtectedRoute>} />
          <Route path="/rooms/:id" element={<ProtectedRoute><div>Room Detail</div></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><div>My Reservations</div></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/rooms" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}