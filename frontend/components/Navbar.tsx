"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-colors">
            OC
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Online Connections
          </span>
        </Link>



        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
          {user && (
            <Link
              href="/messages"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold transition-colors bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200/60"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Messages</span>
            </Link>
          )}

          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/search"
            title="Search members"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200/80 shadow-2xs transition-all active:scale-95"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-bold">Find Users</span>
          </Link>

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <Avatar
                    src={user.profilePic}
                    username={user.username}
                    size="sm"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    @{user.username}
                  </span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">@{user.username}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={`/u/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      👤 My Profile
                    </Link>

                    <Link
                      href="/profile/edit"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      ⚙️ Account Settings
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in shadow-lg">
          {user && (
            <Link
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-blue-600 bg-blue-50"
            >
              💬 Messages
            </Link>
          )}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Home / Dashboard
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find Users
          </Link>

          {!loading && (
            user ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  href={`/u/${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50"
                >
                  <Avatar src={user.profilePic} username={user.username} size="sm" />
                  <span>My Profile (@{user.username})</span>
                </Link>
                <Link
                  href="/profile/edit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
}
