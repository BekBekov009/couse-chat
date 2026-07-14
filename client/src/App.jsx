import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import Lessons from "./components/Lessons";
import Chat from "./components/Chat";
import MessageTeacher from "./components/MessageTeacher";
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student area */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route element={<Layout />}>
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/messages" element={<MessageTeacher />} />
            </Route>
          </Route>

          {/* Admin area */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>

          {/* Shared: public chat, open to any logged-in role */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/chat" element={<Chat />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/lessons" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
