import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import AuthPage from "./Pages/AuthPage";
import ChatsPage from "./Pages/ChatsPage";
import AuthRoutes from "./util/AuthRoutes";
import ProtectedRoutes from "./util/ProtectedRoutes";
import Chat from "./ChatsPage/Chat";

function App() {
  const router = createBrowserRouter([
    {
      element: <AuthRoutes />,
      children: [
        {
          path: "/auth",
          element: <AuthPage />,
        },
      ],
    },
    {
      element: <ProtectedRoutes />,
      children: [
        {
          path: "/chats",
          element: <ChatsPage />,
          children: [
            {
              path: "/chats/:chatId",
              element: <Chat />,
            },
          ],
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
