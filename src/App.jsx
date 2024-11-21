// App.js
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./utils/protectRoute";
import User from "./pages/User";
import Comment from "./pages/Comment";
import CommentList from "./pages/CommentList";
import ReplyList from "./pages/ReplyList";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments/:id"
        element={
          <ProtectedRoute>
            <Comment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <CommentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/replies"
        element={
          <ProtectedRoute>
            <ReplyList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
