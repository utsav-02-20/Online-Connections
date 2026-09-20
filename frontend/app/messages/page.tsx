"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";

interface MockMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

interface Conversation {
  username: string;
  profilePic?: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  isAi?: boolean;
}

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const targetUserParam = searchParams.get("user");

  const [activeTab, setActiveTab] = useState<"friends" | "ai">("friends");
  const [selectedContact, setSelectedContact] = useState<string>("AI Assistant");
  const [messages, setMessages] = useState<Record<string, MockMessage[]>>({});
  const [inputText, setInputText] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversations and localStorage keys
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) setOpenaiApiKey(savedKey);

    const initialMessages: Record<string, MockMessage[]> = {
      "AI Assistant": [
        {
          id: "1",
          sender: "AI Assistant",
          text: "Hello! I am your AI Chat Companion powered by OpenAI API. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAi: true,
        },
      ],
    };

    if (user?.friendsDetails && user.friendsDetails.length > 0) {
      user.friendsDetails.forEach((friend) => {
        initialMessages[friend.username] = [
          {
            id: `init_${friend.username}`,
            sender: friend.username,
            text: `Hey @${user.username}, welcome to Online Connections chat!`,
            timestamp: "10:30 AM",
          },
        ];
      });
    }

    setMessages((prev) => ({ ...initialMessages, ...prev }));

    if (targetUserParam) {
      setSelectedContact(targetUserParam);
      setActiveTab("friends");
    }
  }, [user, targetUserParam]);

  // Auto-scroll to bottom of active chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  const handleSaveApiKey = () => {
    const trimmed = openaiApiKey.trim();
    if (!trimmed) {
      localStorage.removeItem("openai_api_key");
      setOpenaiApiKey("");
      setToastMessage({ text: "API Key removed.", type: "info" });
    } else {
      localStorage.setItem("openai_api_key", trimmed);
      setOpenaiApiKey(trimmed);
      setToastMessage({ text: "OpenAI API Key saved successfully to browser storage!", type: "success" });
    }
    setShowKeyModal(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isAiChat = selectedContact === "AI Assistant";

    const userMsg: MockMessage = {
      id: Date.now().toString(),
      sender: user?.username || "You",
      text: currentText,
      timestamp: timeNow,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), userMsg],
    }));

    setInputText("");

    // If chatting with OpenAI AI Assistant
    if (isAiChat) {
      if (!openaiApiKey) {
        setToastMessage({ text: "Please set your OpenAI API key to get AI responses.", type: "info" });
        setShowKeyModal(true);
        return;
      }

      setAiLoading(true);

      try {
        const history = (messages["AI Assistant"] || []).map((m) => ({
          role: m.sender === "AI Assistant" ? "assistant" : "user",
          content: m.text,
        }));

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a friendly, helpful assistant inside the Online Connections social networking platform.",
              },
              ...history,
              { role: "user", content: currentText },
            ],
            max_tokens: 250,
          }),
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
          const aiReply: MockMessage = {
            id: (Date.now() + 1).toString(),
            sender: "AI Assistant",
            text: data.choices[0].message.content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAi: true,
          };

          setMessages((prev) => ({
            ...prev,
            "AI Assistant": [...(prev["AI Assistant"] || []), aiReply],
          }));
        } else {
          throw new Error(data.error?.message || "Failed to fetch response from OpenAI");
        }
      } catch (err: any) {
        console.error("OpenAI API error:", err);
        setToastMessage({ text: `OpenAI Error: ${err.message}`, type: "error" });
      } finally {
        setAiLoading(false);
      }
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
            You must be logged in to access direct messaging and AI assistant chat interface.
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

      {/* Main Messaging Layout Interface */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] h-[calc(100vh-12rem)]">
        
        {/* Left Sidebar: Conversations list */}
        <div className="md:col-span-4 lg:col-span-4 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col bg-slate-50/50">
          
          {/* Header & Mode Selector */}
          <div className="p-4 border-b border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyModal(true)}
                className="text-xs text-slate-600 hover:text-blue-600 font-bold"
                title="Configure OpenAI API Key"
              >
                🔑 {openaiApiKey ? "API Key Configured" : "Add OpenAI Key"}
              </Button>
            </div>

            {/* Contacts Filter Tabs */}
            <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  setActiveTab("friends");
                  if (user.friendsDetails && user.friendsDetails.length > 0) {
                    setSelectedContact(user.friendsDetails[0].username);
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === "friends" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👥 Friends ({user.friends?.length || 0})
              </button>
              <button
                onClick={() => {
                  setActiveTab("ai");
                  setSelectedContact("AI Assistant");
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === "ai" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🤖 AI Chat
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === "ai" && (
              <div
                onClick={() => setSelectedContact("AI Assistant")}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  selectedContact === "AI Assistant"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "hover:bg-slate-100 text-slate-900"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-xs">
                  🤖
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm truncate">AI Assistant</span>
                    <Badge variant={selectedContact === "AI Assistant" ? "info" : "success"}>OpenAI</Badge>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      selectedContact === "AI Assistant" ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    Powered by gpt-3.5-turbo
                  </p>
                </div>
              </div>
            )}

            {activeTab === "friends" && (
              user.friendsDetails && user.friendsDetails.length > 0 ? (
                user.friendsDetails.map((friend) => (
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
                      </div>
                      <p
                        className={`text-xs truncate ${
                          selectedContact === friend.username ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {friend.about || "Available to chat"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4 text-slate-400 space-y-2">
                  <p className="text-xs">No friends added yet.</p>
                  <Link href="/search">
                    <Button variant="outline" size="sm" className="text-xs">
                      🔍 Find Connections
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col h-full bg-white">
          
          {/* Active Chat Top Bar */}
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              {selectedContact === "AI Assistant" ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                  🤖
                </div>
              ) : (
                <Avatar
                  src={selectedFriendDetail?.profilePic}
                  username={selectedContact}
                  size="md"
                />
              )}
              <div>
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  {selectedContact === "AI Assistant" ? "AI Assistant" : `@${selectedContact}`}
                  {selectedContact === "AI Assistant" && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      GPT-3.5
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedContact === "AI Assistant"
                    ? openaiApiKey
                      ? "Ready for prompts"
                      : "OpenAI API Key needed for live responses"
                    : "Direct Connection"}
                </p>
              </div>
            </div>

            {selectedContact !== "AI Assistant" && (
              <Link href={`/u/${selectedContact}`}>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-blue-600">
                  View Profile →
                </Button>
              </Link>
            )}
          </div>

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {activeMessages.map((msg) => {
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
                        : msg.isAi
                        ? "bg-purple-600 text-white rounded-bl-xs shadow-purple-500/10"
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
                        isMe || msg.isAi ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="flex items-start">
                <div className="bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 animate-pulse">
                  <span>🤖</span> AI is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white flex gap-3 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                selectedContact === "AI Assistant"
                  ? "Ask the AI assistant anything..."
                  : `Message @${selectedContact}...`
              }
              className="flex-1 bg-slate-100 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || aiLoading}
              className="rounded-2xl shrink-0 px-5"
            >
              Send 🚀
            </Button>
          </form>
        </div>
      </div>

      {/* OpenAI API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                🔑 Configure OpenAI API Key
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your personal OpenAI API Key (`sk-...`) to enable live responses from GPT-3.5 Turbo. Your key is stored securely inside your browser&apos;s local storage and is never sent to our database.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowKeyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveApiKey}>
                Save Key
              </Button>
            </div>
          </Card>
        </div>
      )}
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
