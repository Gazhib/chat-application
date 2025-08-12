import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import AuthPage, { action as authAction } from "./routes/AuthPage";
import ChatsPage from "./routes/ChatsPage";
import AuthRoutes from "./util/ui/AuthRoutes";
import ProtectedRoutes from "./util/ui/ProtectedRoutes";
import Chat from "./entities/chat/ui/Chat";
import VerificationPage, {
  action as verifyAction,
} from "./routes/VerificationPage";
import RootLayout from "./RootLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CurrentPage from "./CurrentPage";
import VideoChat from "./routes/VideoChat";

function App() {
  const client = new QueryClient();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          element: <AuthRoutes />,
          children: [
            {
              path: "/auth",
              element: <AuthPage />,
              action: authAction,
            },
            {
              path: "/verify",
              element: <VerificationPage />,
              action: verifyAction,
            },
          ],
        },
        {
          element: <ProtectedRoutes />,
          children: [
            {
              element: <CurrentPage />,
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
                {
                  path: "/call/:callId",
                  element: <VideoChat />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />{" "}
    </QueryClientProvider>
  );
}

export default App;
