import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import AuthPage, { action as authAction } from "./Pages/AuthPage";
import ChatsPage from "./Pages/ChatsPage";
import AuthRoutes from "./util/AuthRoutes";
import ProtectedRoutes from "./util/ProtectedRoutes";
import Chat from "./ChatsPage/Chat";
import VerificationPage, {
  action as verifyAction,
} from "./Pages/VerificationPage";
import RootLayout from "./RootLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store/store";
import CurrentPage from "./util/CurrentPage";

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
              ],
            },
          ],
        },
      ],
    },
  ]);
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />{" "}
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
