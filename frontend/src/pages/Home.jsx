import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from"../components/Sidebar";
import MessageInput from "../components/MessageInput";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import ProfileModal from "../components/ProfileModal";
import useChat from "../hooks/useChat";
import GroupModal from "../components/GroupModal";
import GroupInfoModal from "../components/GroupInfoModal";
import ForwardModal from "../components/ForwardModal";

function Home() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const currentConversationRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [sidebarSearch, setSidebarSearch] =
  useState("");






  useEffect(() => {

  localStorage.setItem(
    "darkMode",
    darkMode
  );

  }, [darkMode]);

  useEffect(() => {

  if (!selectedUser || !showProfile) return;

  API.get(`/user/${selectedUser.id}`)
    .then((res) => {
      setProfileData(res.data);
    })
    .catch((err) => {
      console.log(err);
    });

  }, [selectedUser, showProfile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    console.log("TOKEN:", token);
    API.get("/my-profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        // console.log("Profile Response:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    API.get("/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

      const interval = setInterval(async () => {
      try {
        const res = await API.get(
          "/online-users"
        );

        setOnlineUsers(res.data);

      } catch (err) {
        console.log(err);
      }
    }, 2000);

    return () => clearInterval(interval);

  }, []);

useEffect(() => {

  if (!user) return;

  loadConversations();

}, [user]);

useEffect(() => {

  if (!user) return;

  const interval =
    setInterval(async () => {

      try {

        const res =
          await API.get(
            `/unread-counts/${user.email}`
          );

        setUnreadCounts(
          res.data
        );

      } catch (err) {

        console.log(err);

      }

    }, 2000);

  return () =>
    clearInterval(interval);

}, [user]);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });
  }, [messages]);

  useEffect(() => {
  currentConversationRef.current =
    conversationId;
  }, [conversationId]);

  const refreshConversation =
  async () => {

    if (
      currentConversationRef.current
    ) {

      await loadMessages(
        currentConversationRef.current
      );

    }
   
  };

 const socketRef =
  useChat({
    user,
    currentConversationRef,
    setMessages,
    setTypingUser,
    refreshConversation
  });

  
  const openConversation = async (targetUser) => {
    try {

      if (!user) {
        alert("User data still loading...");
        return;
      }

      const currentUser = user.email;

      const res = await API.post("/conversation", {
        participants: [
          currentUser,
          targetUser.email
        ]
      });
     setConversationId(
      res.data.conversation_id
    );

      await API.put(
        `/conversation/reset-unread/${res.data.conversation_id}`,
        {
          email: user.email
        }
      );

      await API.put(
        `/conversation/delivered/${res.data.conversation_id}`,
        {
          receiver: user.email
        }
      );

      await API.put(
        `/conversation/read/${res.data.conversation_id}`,
        {
          reader: user.email
        }
      );

      await loadMessages(
        res.data.conversation_id
      );

      console.log("Conversation:", res.data);

      setSelectedUser(targetUser);

    } catch (error) {
      console.log(error);
    }
  };

  const openGroup = async (
  group
) => {

  setSelectedGroup(
    group
  );

  setConversationId(
    group.id
  );

  setSelectedUser({
    ...group,
    username:
      group.name,

    email:
      `${group.participants.length} members`,

    is_group:
      true
  });

  await loadMessages(
    group.id
  );

};


const sendMessage = async () => {

  if (
    !message.trim() &&
    !selectedImage
  ) return;

  let imageUrl = null;

  if (selectedImage) {

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedImage
    );

    const uploadRes =
      await API.post(
        "/upload-chat-image",
        formData
      );

    imageUrl =
      uploadRes.data.image_url;

  }

 await API.post(
  "/message",
  {
    conversation_id:
      conversationId,

    sender_email:
      user.email,

    message:
      message,

    image_url:
      imageUrl,

    reply_to:
      replyMessage
        ? replyMessage.message
        : null
  }
);

  setMessage("");
  setReplyMessage(
  null
  );
  setSelectedImage(null);

  await loadMessages(
    conversationId
  );

};

const loadMessages = async (conversationId) => {

  const res = await API.get(
    `/messages/${conversationId}`
  );

  setMessages(res.data);
};

const loadConversations = async () => {

  try {

    const res = await API.get(
      `/conversations/${user.email}`
    );

    setConversations(
      res.data
    );

    return res.data;

  } catch (err) {

    console.log(err);

    return [];

  }

};

  // console.log("Current User State:", user);
  return (
    <div className={`flex h-screen ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100"
      }`}
    >

      {/* Sidebar */}
      <Sidebar
        users={users}
        user={user}
        onlineUsers={onlineUsers}
        openConversation={openConversation}
        navigate={navigate}
        unreadCounts={unreadCounts}
        showGroupModal={showGroupModal}
        setShowGroupModal={setShowGroupModal}
        conversations={conversations}
        openGroup={openGroup}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarSearch={sidebarSearch}
        setSidebarSearch={setSidebarSearch}
      />
      

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">

        {selectedUser ? (

          <>
            <ChatHeader
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              setShowProfile={setShowProfile}
              setShowGroupInfo={setShowGroupInfo}
              searchText={searchText}
              setSearchText={setSearchText}
              darkMode={darkMode}
            />

            <MessageList
              messages={messages}
              user={user}
              selectedUser={selectedUser}
              searchText={searchText}
              messagesEndRef={messagesEndRef}
              loadMessages={loadMessages}
              conversationId={conversationId}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              darkMode={darkMode}
              forwardMessage={forwardMessage}
              setForwardMessage={setForwardMessage}
              setShowForwardModal={setShowForwardModal}
            />

            <MessageInput
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              typingUser={typingUser}
              socketRef={socketRef}
              conversationId={conversationId}
              user={user}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              darkMode={darkMode}
              loadMessages={loadMessages}
            />
          </>

        ) : (

          <div className="flex-1 flex items-center justify-center text-gray-500">

            Select a user to start chatting

          </div>

        )}

      </div>

      {showProfile && profileData && (

      <ProfileModal
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        profileData={profileData}
        onlineUsers={onlineUsers}
      />
    )}

    <GroupModal
      users={users}
      user={user}
      showGroupModal={showGroupModal}
      setShowGroupModal={setShowGroupModal}
      loadConversations={loadConversations}
    />

    <GroupInfoModal
      showGroupInfo={showGroupInfo}
      setShowGroupInfo={setShowGroupInfo}
      setSelectedGroup={setSelectedGroup}
      selectedGroup={selectedGroup}
      users={users}
      loadConversations={loadConversations}
    />

    <ForwardModal
      showForwardModal={showForwardModal}
      setShowForwardModal={setShowForwardModal}
      forwardMessage={forwardMessage}
      users={users}
      conversations={conversations}
      user={user}
    />

    </div>
  );
}

export default Home;