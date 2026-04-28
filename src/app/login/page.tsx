"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message ?? "Failed to sign in");
      } else {
        router.push("/bracket");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-md p-8 rounded-xl bg-white/10 shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition text-white placeholder-white/30"
              placeholder="admin@ceta.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/20 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition text-white placeholder-white/30"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-full bg-[hsl(280,100%,70%)] px-4 py-3 font-semibold text-white transition hover:bg-[hsl(280,100%,65%)] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-white/50 hover:text-white transition">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
