"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";

interface MockMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const targetUserParam = searchParams.get("user");

  const [selectedContact, setSelectedContact] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, MockMessage[]>>({});
  const [inputText, setInputText] = useState("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set default selected contact on mount / friends load (select most recent conversation)
  useEffect(() => {
    if (user?.friendsDetails && user.friendsDetails.length > 0) {
      if (targetUserParam && user.friendsDetails.some((f) => f.username === targetUserParam)) {
        setSelectedContact(targetUserParam);
      } else if (!selectedContact) {
        // Read local storage to determine contact with most recent message timestamp
        const localStoreKey = `local_messages_${user.username}`;
        const savedLocal = localStorage.getItem(localStoreKey);
        let localData: Record<string, MockMessage[]> = {};
        if (savedLocal) {
          try {
            localData = JSON.parse(savedLocal);
          } catch (e) {
            console.error(e);
          }
        }

        const sortedFriends = [...user.friendsDetails].sort((a, b) => {
          const threadA = localData[a.username] || [];
          const threadB = localData[b.username] || [];
          const lastMsgA = threadA[threadA.length - 1];
          const lastMsgB = threadB[threadB.length - 1];
          const timeA = lastMsgA ? (lastMsgA.id.startsWith("msg_") ? parseInt(lastMsgA.id.split("_")[1], 10) : 0) : 0;
          const timeB = lastMsgB ? (lastMsgB.id.startsWith("msg_") ? parseInt(lastMsgB.id.split("_")[1], 10) : 0) : 0;
          return timeB - timeA;
        });

        setSelectedContact(sortedFriends[0].username);
      }
    }
  }, [user, targetUserParam]);

  // Load local messages and sync conversation state using Updation ID
  useEffect(() => {
    if (!user) return;

    const loadLocalAndSync = async () => {
      const localStoreKey = `local_messages_${user.username}`;
      const savedLocal = localStorage.getItem(localStoreKey);
      let localData: Record<string, MockMessage[]> = {};

      if (savedLocal) {
        try {
          localData = JSON.parse(savedLocal);
        } catch (e) {
          console.error("Failed to parse local messages", e);
        }
      }

      setMessages(localData);

      if (!selectedContact) return;

      // Perform Server Synchronization using Updation ID per contact
      try {
        const contactUpdationKey = `updation_id_${user.username}_${selectedContact}`;
        const lastUpdationId = parseInt(localStorage.getItem(contactUpdationKey) || "0", 10);
        const token = localStorage.getItem("accessToken");

        const syncRes = await apiRequest<{
          success: boolean;
          updationId: number;
          chatPayload?: string;
          status?: string;
          lastSender?: string;
        }>(
          "/messages/sync",
          {
            method: "POST",
            body: JSON.stringify({
              peerUsername: selectedContact,
              clientUpdationId: lastUpdationId,
              localChatPayload: JSON.stringify(localData[selectedContact] || []),
            }),
          },
          token
        );

        if (syncRes.success) {
          if (syncRes.updationId) {
            localStorage.setItem(contactUpdationKey, syncRes.updationId.toString());
          }

          if (syncRes.chatPayload) {
            try {
              const serverChat: MockMessage[] = JSON.parse(syncRes.chatPayload);
              if (Array.isArray(serverChat) && serverChat.length > 0) {
                setMessages((prev) => {
                  const currentLocal = prev[selectedContact] || [];
                  // Merge by msg id keeping order
                  const existingIds = new Set(currentLocal.map((m) => m.id));
                  const merged = [...currentLocal];
                  serverChat.forEach((sm) => {
                    if (!existingIds.has(sm.id)) {
                      merged.push(sm);
                    }
                  });
                  const updated = { ...prev, [selectedContact]: merged };
                  localStorage.setItem(localStoreKey, JSON.stringify(updated));
                  return updated;
                });
              }
            } catch (e) {
              console.error("Failed to parse server chat payload", e);
            }
          }
        }
      } catch (err) {
        console.warn("Background sync unavailable:", err);
      }
    };

    loadLocalAndSync();

    // Auto Scanner polling comparing updationId per contact
    const interval = setInterval(async () => {
      if (!selectedContact) return;

      try {
        const contactUpdationKey = `updation_id_${user.username}_${selectedContact}`;
        const lastUpdationId = parseInt(localStorage.getItem(contactUpdationKey) || "0", 10);
        const token = localStorage.getItem("accessToken");

        const syncRes = await apiRequest<{
          success: boolean;
          updationId: number;
          chatPayload?: string;
          lastSender?: string;
          status?: string;
        }>(
          "/messages/sync",
          {
            method: "POST",
            body: JSON.stringify({
              peerUsername: selectedContact,
              clientUpdationId: lastUpdationId,
            }),
          },
          token
        );

        if (syncRes.success && syncRes.updationId > lastUpdationId) {
          localStorage.setItem(contactUpdationKey, syncRes.updationId.toString());

          if (syncRes.chatPayload) {
            try {
              const latestChat: MockMessage[] = JSON.parse(syncRes.chatPayload);
              if (Array.isArray(latestChat)) {
                setMessages((prev) => {
                  const localStoreKey = `local_messages_${user.username}`;
                  const currentLocal = prev[selectedContact] || [];
                  const existingIds = new Set(currentLocal.map((m) => m.id));
                  const merged = [...currentLocal];
                  latestChat.forEach((sm) => {
                    if (!existingIds.has(sm.id)) {
                      merged.push(sm);
                    }
                  });
                  const updated = { ...prev, [selectedContact]: merged };
                  localStorage.setItem(localStoreKey, JSON.stringify(updated));
                  return updated;
                });

                if (syncRes.lastSender && syncRes.lastSender.toLowerCase() !== user.username.toLowerCase()) {
                  setToastMessage({
                    text: `📩 New message received from @${syncRes.lastSender}!`,
                    type: "success",
                  });
                  try {
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.volume = 0.5;
                    audio.play().catch(() => {});
                  } catch (e) {}
                }
              }
            } catch (e) {
              console.error("Payload parse error", e);
            }
          }
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [user, selectedContact]);

  // Auto-scroll to bottom of active chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact || !user) return;

    const currentText = inputText.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: MockMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sender: user.username,
      text: currentText,
      timestamp: timeNow,
    };

    const updatedChatThread = [...(messages[selectedContact] || []), userMsg];

    // Save to local state and update Local Device Storage
    setMessages((prev) => {
      const updated = {
        ...prev,
        [selectedContact]: updatedChatThread,
      };
      localStorage.setItem(`local_messages_${user.username}`, JSON.stringify(updated));
      return updated;
    });

    setInputText("");

    // Send updated conversation payload & new updationId to server
    try {
      const newUpdationId = Date.now();
      const token = localStorage.getItem("accessToken");

      const sendRes = await apiRequest<{ success: boolean; updationId: number }>(
        "/messages/send",
        {
          method: "POST",
          body: JSON.stringify({
            receiverUsername: selectedContact,
            fullChatPayload: JSON.stringify(updatedChatThread),
            newUpdationId,
          }),
        },
        token
      );

      if (sendRes.success && sendRes.updationId) {
        localStorage.setItem(`updation_id_${user.username}_${selectedContact}`, sendRes.updationId.toString());
      }
    } catch (err) {
      console.warn("Message stored on local device. Will sync when server connection is restored.", err);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-4">
        <Skeleton variant="rectangular" className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Card className="p-8 space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            💬
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sign In to Message</h1>
          <p className="text-slate-500 text-sm">
            You must be logged in to access direct messaging with your connections.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/login">
              <Button variant="primary" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="md">
                Register
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const activeMessages = messages[selectedContact] || [];
  const selectedFriendDetail = user.friendsDetails?.find((f) => f.username === selectedContact);

  return (
    <div className="max-w-6xl mx-auto py-2 animate-fade-in space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Messaging Layout Interface with Isolated Box Height & Independent Scroll */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-10rem)] max-h-[750px] min-h-[500px]">
        
        {/* Left Sidebar: Conversations List (Isolated Vertical Scroll) */}
        <div className="md:col-span-4 lg:col-span-4 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col bg-slate-50/50 h-full overflow-hidden">
          
          {/* Header (Fixed Top inside Sidebar) */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
            <span className="text-xs font-bold text-slate-400">
              {user.friends?.length || 0} Connections
            </span>
          </div>

          {/* Friends List (Sorted by most recent message timestamp) */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-2 space-y-1">
            {user.friendsDetails && user.friendsDetails.length > 0 ? (
              [...user.friendsDetails]
                .sort((a, b) => {
                  const threadA = messages[a.username] || [];
                  const threadB = messages[b.username] || [];
                  const lastMsgA = threadA[threadA.length - 1];
                  const lastMsgB = threadB[threadB.length - 1];

                  // Parse timestamp or fallback
                  const timeA = lastMsgA ? (lastMsgA.id.startsWith("msg_") ? parseInt(lastMsgA.id.split("_")[1], 10) : 0) : 0;
                  const timeB = lastMsgB ? (lastMsgB.id.startsWith("msg_") ? parseInt(lastMsgB.id.split("_")[1], 10) : 0) : 0;

                  return timeB - timeA;
                })
                .map((friend) => {
                  const thread = messages[friend.username] || [];
                  const lastMsg = thread[thread.length - 1];
                  return (
                    <div
                      key={friend.username}
                      onClick={() => setSelectedContact(friend.username)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        selectedContact === friend.username
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "hover:bg-slate-100 text-slate-900"
                      }`}
                    >
                      <Avatar src={friend.profilePic} username={friend.username} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm truncate">@{friend.username}</span>
                          {lastMsg && (
                            <span
                              className={`text-[10px] font-medium shrink-0 ml-1 ${
                                selectedContact === friend.username ? "text-blue-100" : "text-slate-400"
                              }`}
                            >
                              {lastMsg.timestamp}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate ${
                            selectedContact === friend.username ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {lastMsg ? `${lastMsg.sender === user.username ? "You: " : ""}${lastMsg.text}` : (friend.about || "Available to chat")}
                        </p>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-12 px-4 text-slate-400 space-y-3">
                <p className="text-xs">No connections added yet.</p>
                <Link href="/search">
                  <Button variant="outline" size="sm" className="text-xs">
                    🔍 Find Connections
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Chat Area (Isolated Vertical Scroll) */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col h-full overflow-hidden bg-white">
          
          {/* Active Chat Top Bar (Fixed Top inside Right Area) */}
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-xs">
            {selectedContact ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedFriendDetail?.profilePic}
                    username={selectedContact}
                    size="md"
                  />
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base">
                      @{selectedContact}
                    </h2>
                    <p className="text-xs text-slate-400">Direct Connection</p>
                  </div>
                </div>

                <Link href={`/u/${selectedContact}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-blue-600">
                    View Profile →
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-slate-400 text-xs">Select a contact to begin messaging</div>
            )}
          </div>

          {/* Messages Thread Container (Scroll isolated inside div only) */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-6 space-y-4 bg-slate-50/30">
            {selectedContact && activeMessages.length > 0 ? (
              activeMessages.map((msg) => {
                const isMe = msg.sender === user.username;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-xs text-sm leading-relaxed ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[10px] font-bold block mb-1 opacity-80">
                          {msg.sender}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`text-[10px] block text-right mt-1 opacity-70 ${
                          isMe ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                {selectedContact ? `No message history with @${selectedContact} yet. Say hello!` : "Select a contact from the left list."}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Box */}
          {selectedContact && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white flex gap-3 items-center shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message @${selectedContact}...`}
                className="flex-1 bg-slate-100 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim()}
                className="rounded-2xl shrink-0 px-5"
              >
                Send 🚀
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading messaging center...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
