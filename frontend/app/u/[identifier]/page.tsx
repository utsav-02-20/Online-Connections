"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, User, AuthResponse } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";

export default function UserProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = use(params);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { user, token, addFriend } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, [identifier, user]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      if (user && (user.id === identifier || user.username.toLowerCase() === identifier.toLowerCase())) {
        setProfile(user);
        setLoading(false);
        return;
      }

      const data = await apiRequest<AuthResponse>(
        `/profile/${encodeURIComponent(identifier)}`,
        { method: "GET" },
        token
      );
      if (data.success && data.user) {
        setProfile(data.user);
      } else {
        setError("User profile not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    try {
      await addFriend(profile.username);
      setToastMessage({ text: `Added @${profile.username} to your friends!`, type: "success" });
      await fetchProfile();
    } catch (err: any) {
      setToastMessage({ text: err.message || "Could not add friend", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton variant="rectangular" className="h-64 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" className="h-40 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-medium">
          {error || "User profile not found"}
        </div>
        <Link href="/search">
          <Button variant="outline" size="sm">
            ← Back to User Search
          </Button>
        </Link>
      </div>
    );
  }

  const isSelf = Boolean(
    user && (user.id === profile.id || user.username.toLowerCase() === profile.username.toLowerCase())
  );
  const isAlreadyFriend = user?.friends?.includes(profile.username);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Profile Header & Banner Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-lg overflow-hidden relative">
        {/* Cover Banner Gradient */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Content Overlay */}
        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 mb-4 text-center sm:text-left">
            {/* Overlapping Avatar */}
            <div className="relative">
              <Avatar
                src={profile.profilePic}
                username={profile.username}
                size="xl"
                className="ring-4 ring-white shadow-xl"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-0">
              {isSelf ? (
                <Link href="/profile/edit">
                  <Button variant="outline" size="md">
                    ⚙️ Edit Profile
                  </Button>
                </Link>
              ) : (
                user && (
                  <Button
                    variant={isAlreadyFriend ? "secondary" : "primary"}
                    size="md"
                    disabled={isAlreadyFriend}
                    onClick={handleAddFriend}
                    className="shadow-sm"
                  >
                    {isAlreadyFriend ? "✓ Friends" : "+ Add Friend"}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Identity & Badges */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                @{profile.username}
              </h1>
              {isSelf && <Badge variant="info">Owner</Badge>}
              {profile.phoneVerified && <Badge variant="success">✓ Verified</Badge>}
            </div>

            {isSelf && profile.email && (
              <p className="text-slate-500 text-sm font-medium">{profile.email}</p>
            )}

            {profile.createdAt && (
              <p className="text-slate-400 text-xs font-medium pt-1">
                📅 Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className={`grid grid-cols-1 ${isSelf ? "md:grid-cols-2" : ""} gap-6`}>
        {/* Bio Card */}
        <Card className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            About Me
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {profile.about || "No bio information provided yet."}
          </p>
        </Card>

        {/* Contact Details (STRICTLY PRIVATE FOR SELF PROFILE) */}
        {isSelf && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Contact & Details (Private)
              </h2>
              <Badge variant="neutral">Private to You</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Phone Number</span>
                <span className="text-sm text-slate-900 font-semibold">
                  {profile.phone || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Address / Location</span>
                <span className="text-sm text-slate-900 font-semibold">
                  {profile.address || "Not specified"}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Friends Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Friends Network ({profile.friends?.length || (profile as any).friendsCount || 0})
          </h2>
          <Badge variant="info">Connections</Badge>
        </div>

        {!profile.friends || profile.friends.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">No friends added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.friends.map((friendName) => (
              <Link key={friendName} href={`/profile/${friendName}`}>
                <div className="bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all">
                  <Avatar username={friendName} size="sm" />
                  <span className="text-xs font-bold text-slate-800 hover:text-blue-600">
                    @{friendName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
