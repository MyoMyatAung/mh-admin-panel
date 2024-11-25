// ProtectedRoute.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  // const token = localStorage.getItem("token");

  // useEffect(() => {
  //   if (!token) {
  //     // Redirect to login if token is missing
  //     navigate("/login", { replace: true });
  //   }
  // }, [token, navigate]);

  // Return children only if token exists, otherwise render nothing
  // return token ? children : null;
  return children;
};

export default ProtectedRoute;
