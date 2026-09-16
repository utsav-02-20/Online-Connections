"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, User, UsersResponse } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { UserCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { user, token, addFriend } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setToastMessage(null);

    try {
      const data = await apiRequest<UsersResponse>(
        `/users/search?username=${encodeURIComponent(query.trim())}`,
        { method: "GET" },
        token
      );

      if (data.success && data.users) {
        setResults(data.users);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleAddFriend = async (friendUsername: string) => {
    if (!user) {
      setToastMessage({ text: "Please log in to add friends.", type: "error" });
      return;
    }

    try {
      await addFriend(friendUsername);
      setToastMessage({
        text: `Successfully added @${friendUsername} as a friend!`,
        type: "success",
      });
    } catch (err: any) {
      setToastMessage({
        text: err.message || "Failed to add friend",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Search Header Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="info">Directory Search</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Connections
        </h1>
        <p className="text-slate-500 text-sm">
          Search for registered members on Online Connections by username.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Search Bar Input */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <div className="absolute left-4 top-3.5 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username (e.g., johndoe)"
            className="w-full bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400 rounded-2xl pl-12 pr-4 py-3.5 text-sm shadow-sm transition-all outline-none"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="sm:w-auto"
        >
          Search Members
        </Button>
      </form>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      )}

      {/* Search Results */}
      {!loading && searched && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Search Results ({results.length})
            </h2>
            {query && (
              <span className="text-xs text-slate-400">
                Matching &quot;{query}&quot;
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={`No users found matching "${query}"`}
              description="Try searching with a different username or check for typos."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((u) => {
                const isSelf = user?.username === u.username;
                const isAlreadyFriend = user?.friends?.includes(u.username);

                return (
                  <Card
                    key={u.id || u.username}
                    hoverEffect
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar src={u.profilePic} username={u.username} size="lg" />
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${u.username}`}
                          className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors block truncate"
                        >
                          @{u.username}
                        </Link>
                        {u.about ? (
                          <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                            {u.about}
                          </p>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No bio</span>
                        )}
                      </div>
                    </div>

                    {!isSelf && user && (
                      <Button
                        variant={isAlreadyFriend ? "secondary" : "primary"}
                        size="sm"
                        disabled={isAlreadyFriend}
                        onClick={() => handleAddFriend(u.username)}
                        className="shrink-0"
                      >
                        {isAlreadyFriend ? "✓ Friends" : "+ Add Friend"}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
