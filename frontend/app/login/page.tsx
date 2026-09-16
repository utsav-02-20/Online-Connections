"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(identifier, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-6 animate-fade-in">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Left Hero Section (Desktop Split-Screen) */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-white text-lg">
              OC
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Welcome back to Online Connections
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign in to manage your public bio, connect with friends, and discover members across the platform.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/15">
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
              <span>Dual JWT Secure Session</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
              <span>Verified Contact Details</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-slate-500 text-xs mt-1">Enter your details to access your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="johndoe or john@example.com"
            />

            <Input
              label="Password"
              required
              isPassword
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <a href="#" className="text-xs font-bold text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
