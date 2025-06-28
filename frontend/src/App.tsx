import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import AuthPage from "./Pages/Auth";

function App() {
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: <AuthPage />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
