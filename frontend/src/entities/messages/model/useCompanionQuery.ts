import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import { port } from "@/util/ui/ProtectedRoutes";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export default function useCompanionQuery() {
  const { chatId } = useParams();

  const navigate = useNavigate();

  const setCompanionId = useUserStore((state) => state.setCompanionId);

  const { data } = useQuery({
    queryKey: [chatId, "companion"],
    queryFn: async (): Promise<userInfo> => {
      const companionResponse = await fetch(
        `${port}/chats/${chatId}/companion`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!companionResponse.ok) navigate("/auth?mode=login");

      const { companion } = await companionResponse.json();

      setCompanionId(companion._id);
      return companion;
    },
    enabled: !!chatId,
    staleTime: Infinity,
  });

  return { companion: data };
}

export const getCompanion = async (chatId: string) => {
  const companionResponse = await fetch(`${port}/chats/${chatId}/companion`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!companionResponse.ok) throw new Error("Failed to fetch companion");
  const { companion } = await companionResponse.json();
  return companion as userInfo;
};
