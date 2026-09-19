import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useApp();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
