"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";

export default function EditProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [about, setAbout] = useState("");

  const [picSourceMode, setPicSourceMode] = useState<"upload" | "camera" | "url">("upload");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPhoneVerified(Boolean(user.phoneVerified));
      setAddress(user.address || "");
      setProfilePic(user.profilePic || "");
      setAbout(user.about || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setToastMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setToastMessage({ text: "Unable to access camera. Check permissions.", type: "error" });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setProfilePic(dataUrl);
      stopCamera();
      setToastMessage({ text: "Photo captured successfully!", type: "success" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToastMessage({ text: "Please select a valid image file.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setProfilePic(compressedDataUrl);
          setToastMessage({ text: "Image uploaded & resized successfully!", type: "success" });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (authLoading) {
    return <div className="text-center py-12 text-slate-400">Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        Please log in to edit your profile settings.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);
    setSaving(true);
    stopCamera();

    try {
      await updateProfile({
        email,
        phone,
        phoneVerified,
        address,
        profilePic,
        about,
      });
      setToastMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => {
        router.push(`/u/${user.username}`);
      }, 1000);
    } catch (err: any) {
      setToastMessage({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm">Update your avatar photo, public bio, and private details</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Avatar & Photo Controls */}
        <Card className="lg:col-span-1 space-y-5 sticky top-24">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Profile Photo
          </h2>

          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <Avatar src={profilePic} username={user.username} size="xl" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {profilePic ? "Custom Picture Active" : "Default Initials"}
              </span>
              {profilePic && (
                <button
                  type="button"
                  onClick={() => setProfilePic("")}
                  className="text-[11px] text-red-600 hover:underline font-semibold mt-1"
                >
                  ✕ Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setPicSourceMode("upload");
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                picSourceMode === "upload" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📁 File
            </button>
            <button
              type="button"
              onClick={() => {
                setPicSourceMode("camera");
                startCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                picSourceMode === "camera" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📷 Camera
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setPicSourceMode("url");
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                picSourceMode === "url" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔗 URL
            </button>
          </div>

          {/* Tab 1: Upload */}
          {picSourceMode === "upload" && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          )}

          {/* Tab 2: Camera */}
          {picSourceMode === "camera" && (
            <div className="space-y-3">
              {!cameraActive ? (
                <Button type="button" variant="outline" size="sm" onClick={startCamera} className="w-full">
                  Start Camera Feed
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-slate-200">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="primary" size="sm" onClick={capturePhoto} className="flex-1">
                      📸 Snap
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={stopCamera}>
                      Stop
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: URL Input */}
          {picSourceMode === "url" && (
            <Input
              type="url"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          )}
        </Card>

        {/* Right Column: Editable Profile Form */}
        <Card className="lg:col-span-2 space-y-5">
          <Input
            label="Username (Read Only)"
            disabled
            value={user.username}
            className="bg-slate-50 text-slate-400 cursor-not-allowed"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199"
            />

            <div className="pb-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={phoneVerified}
                  onChange={(e) => setPhoneVerified(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Mark Phone as Verified
              </label>
            </div>
          </div>

          <Input
            label="Address / Location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="San Francisco, CA"
          />

          {/* About / Bio textarea with Character Counter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                About / Bio
              </label>
              <span className={`text-[11px] font-bold ${about.length > 450 ? "text-amber-600" : "text-slate-400"}`}>
                {about.length}/500
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell others a bit about your background and interests..."
              className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all shadow-xs"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              className="w-full sm:w-auto shadow-md"
            >
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
