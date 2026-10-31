import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Signup from "./Pages/SignUp/Signup";
import Authlayout from "./Layouts/Authlayout";
import Signin from "./Pages/Signin/Signin";
import Mainlayout from "./Layouts/Mainlayout";
import Feed from "./Pages/Feed/Feed";
import Notfound from "./Pages/NotFound/Notfound";
import Profile from "./Pages/Profile/Profile";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./Components/ProtectedRoute";
import PostDetails from "./Pages/PostDetails/PostDetails";
import ChangePassword from "./Pages/ChangePassword/ChangePassword";

const router = createBrowserRouter([
  {
    element: <Authlayout />,
    children: [
      { path: "/signup", element: <Signup /> },
      { path: "/signin", element: <Signin /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Mainlayout />,
        children: [
          { path: "/", element: <Feed /> },
          { path: "/posts/:postId", element: <PostDetails /> },
          { path: "/profile", element: <Profile /> },
          { path: "/change-password", element: <ChangePassword /> },
        ],
      },
    ],
  },
  { path: "*", element: <Notfound /> },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App

