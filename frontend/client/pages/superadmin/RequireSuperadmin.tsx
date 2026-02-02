import { Navigate, Outlet } from "react-router-dom";
import { isSuperadmin } from "@/lib/auth";

export default function RequireSuperadmin() {
  if (!isSuperadmin()) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
