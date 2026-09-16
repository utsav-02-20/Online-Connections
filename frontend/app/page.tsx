"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-6 py-6 max-w-5xl mx-auto">
        <Skeleton variant="rectangular" className="h-48 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="rectangular" className="h-28 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-28 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto animate-fade-in">
      {user ? (
        /* Authenticated Dashboard View */
        <div className="space-y-8">
          {/* Welcome Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <span>✨</span> Welcome to Online Connections
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Hello, @{user.username}!
              </h1>

              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Connect with members across the platform, manage your public bio, and build your social graph seamlessly.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/search">
                  <Button variant="secondary" size="md" className="bg-white text-blue-700 hover:bg-blue-50 shadow-md">
                    🔍 Discover Users
                  </Button>
                </Link>
                <Link href={`/u/${user.username}`}>
                  <Button variant="ghost" size="md" className="text-white hover:bg-white/15 border border-white/20">
                    👤 View My Profile
                  </Button>
                </Link>
                <Link href="/profile/edit">
                  <Button variant="ghost" size="md" className="text-white hover:bg-white/15 border border-white/20">
                    ⚙️ Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 4-Card Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverEffect className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Tag</span>
              <p className="text-lg font-extrabold text-slate-900 truncate">@{user.username}</p>
              <p className="text-xs text-slate-500">Active Profile</p>
            </Card>

            <Card hoverEffect className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Connections</span>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-blue-600">{user.friends?.length || 0}</p>
                <Badge variant="info">Friends</Badge>
              </div>
              <p className="text-xs text-slate-500">Network Connections</p>
            </Card>

            <Card hoverEffect className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Verification</span>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-slate-900">
                  {user.phoneVerified ? "Verified" : "Unverified"}
                </p>
                <Badge variant={user.phoneVerified ? "success" : "warning"}>
                  {user.phoneVerified ? "✓ Verified" : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Security Status</p>
            </Card>

            <Card hoverEffect className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</span>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-slate-900">
                  {user.about ? "Complete" : "Basic"}
                </p>
                <Badge variant="neutral">Active</Badge>
              </div>
              <p className="text-xs text-slate-500">Public Visibility</p>
            </Card>
          </div>

          {/* Recent Friends / Connections Grid */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Your Social Network</h2>
                <p className="text-xs text-slate-500">People connected with your account</p>
              </div>
              <Link href="/search">
                <Button variant="outline" size="sm">
                  + Add Connections
                </Button>
              </Link>
            </div>

            {!user.friends || user.friends.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center text-xl">
                  🤝
                </div>
                <p className="text-sm font-semibold text-slate-700">No connections added yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Search for registered members on Online Connections to start building your network.
                </p>
                <Link href="/search" className="inline-block pt-2">
                  <Button variant="primary" size="sm">
                    Find Users Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.friends.map((friendName) => (
                  <Link key={friendName} href={`/profile/${friendName}`}>
                    <div className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-400 hover:shadow-xs transition-all flex items-center gap-3 bg-slate-50/50 hover:bg-white group">
                      <Avatar username={friendName} size="md" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-900 text-sm block truncate group-hover:text-blue-600 transition-colors">
                          @{friendName}
                        </span>
                        <span className="text-xs text-slate-400 block">Connected</span>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Guest Landing Page */
        <div className="space-y-16 py-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <Badge variant="info" size="md">
              ⚡ Pure REST API & Modern Frontend Platform
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Connect with People on <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Online Connections
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              A high-performance social networking directory. Search users, view public profiles, and build real-time connections.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/register">
                <Button variant="primary" size="lg" className="shadow-lg shadow-blue-500/20">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                🔐
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Secure Dual JWT Auth</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Short-lived 15m access tokens combined with HTTP-Only refresh cookies for maximum security.
              </p>
            </Card>

            <Card hoverEffect className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                👤
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Rich User Profiles</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Personalize bios, location details, avatar photos (upload or camera), and verified phone badges.
              </p>
            </Card>

            <Card hoverEffect className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                🤝
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Mutual Friendship</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Instant user search and mutual friend connections across the social graph.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
