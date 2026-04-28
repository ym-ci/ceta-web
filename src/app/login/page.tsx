"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <Card className="w-full max-w-md border-white/20 bg-black rounded-none">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 border-2 border-white flex items-center justify-center text-2xl font-black">
              C
            </div>
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tighter text-center">Admin Access</CardTitle>
          <CardDescription className="text-white/40 uppercase text-[10px] tracking-[0.3em] text-center">
            Tournament Management Portal
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Badge variant="destructive" className="w-full justify-center mb-6 rounded-none py-2 text-[10px] font-bold uppercase tracking-widest border-none">
              {error}
            </Badge>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-white/10 bg-white/5 focus-visible:ring-0 focus-visible:border-white transition-colors"
                placeholder="admin@ceta.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-white/10 bg-white/5 focus-visible:ring-0 focus-visible:border-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="outline"
              className="w-full h-12 mt-4 rounded-none border-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-white/10 mt-6 pt-6">
          <Button asChild variant="link" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors p-0 h-auto">
            <Link href="/">
              &larr; Terminate Terminal
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
