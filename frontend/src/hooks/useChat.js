import { useEffect, useRef } from "react";
import API from "../services/api";

function useChat({
  user,
  currentConversationRef,
  setMessages,
  setTypingUser,
  refreshConversation
}) {
  

  const socketRef = useRef(null);

  useEffect(() => {

    if (!user) return;



    


    const WS_URL =
  import.meta.env.VITE_API_URL
    .replace("https://", "wss://")
    .replace("http://", "ws://");

socketRef.current =
  new WebSocket(
    `${WS_URL}/ws/${user.email}`
  );

    socketRef.current.onopen = () => {

      console.log(
        "WebSocket Connected"
      );

    };

    socketRef.current.onmessage =
    async (event) => {

      const data =
        JSON.parse(event.data);

      // Typing Event
      if (
        data.type === "typing"
      ) {

        if (
          data.sender !== user.email &&
          data.conversation_id &&
          currentConversationRef.current &&
          data.conversation_id === currentConversationRef.current
        ) {

          setTypingUser(
            data.sender_name || data.sender
          );

          setTimeout(() => {

            setTypingUser("");

          }, 2000);

        }

        return;
      }

      // Read Update
      if (
        data.type ===
        "read_update"
      ) {

        if (
          data.conversation_id ===
          currentConversationRef.current
        ) {

          await refreshConversation();

        }

        return;
      }

      // Delivered Update
      if (
        data.type ===
        "status_update"
      ) {

        if (
          data.conversation_id ===
          currentConversationRef.current
        ) {

          await refreshConversation();

        }

        return;
      }

      console.log("==========");
      console.log("WS DATA:", data);

      if (
        data.conversation_id ===
        currentConversationRef.current
      ) {

        setMessages((prev) => [
          ...prev,
          data
        ]);

        if (
          data.sender_email !==
          user.email &&
          data.id
        ) {

          await API.put(
            `/message/delivered/${data.id}`
          );

          await refreshConversation();

        }

      }

    };

    return () => {

      socketRef.current?.close();

    };

  }, [user]);

  return socketRef;

}

export default useChat;