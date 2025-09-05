import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import type { MessageSchema } from "../ui/message-bubble/model/types";
import { port } from "@/util/ui/ProtectedRoutes";
import { useNavigate, useParams } from "react-router";

type chatData = {
  messages: MessageSchema[];
  hasMore: boolean;
  nextCursor: string | null | undefined;
};

export default function useMessagesQuery() {
  const { chatId } = useParams();

  const navigate = useNavigate();

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery<
      chatData,
      Error,
      InfiniteData<chatData>,
      [string, string],
      { nextCursor: string | "" }
    >({
      initialPageParam: {
        nextCursor: "",
      },
      queryKey: [chatId!, "messages"],
      queryFn: async ({ pageParam }): Promise<chatData> => {
        const chatResponse = await fetch(
          `${port}/chats/${chatId}/messages?limit=30&beforeId=${
            pageParam.nextCursor || ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!chatResponse.ok) navigate("/auth?mode=login");

        const { nextCursor, messages, hasMore } = await chatResponse.json();

        return {
          messages: messages.reverse(),
          hasMore,
          nextCursor,
        };
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasMore && lastPage.nextCursor
          ? { nextCursor: lastPage.nextCursor }
          : undefined,
      staleTime: Infinity,
    });

  return { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage };
}
