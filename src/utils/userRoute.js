// ProtectedRoute.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserInfoQuery } from "../services/postApi";

const ProtectedUser = ({ children }) => {
  const { data: user, isLoading } = useGetUserInfoQuery({});
  const userData = user?.data;

  const is_admin = userData?.is_admin;

  const navigate = useNavigate();

  useEffect(() => {
    if (is_admin === 0) {
      // Redirect to login if token is missing
      navigate("/", { replace: true });
    }
  }, [is_admin, navigate]);

  // Return children only if token exists, otherwise render nothing
  return is_admin === 1 ? children : null;
};

export default ProtectedUser;
