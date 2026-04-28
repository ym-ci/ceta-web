"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProd, setIsProd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only disable in true production environment
    // if (process.env.NODE_ENV === "production") {
    //   setIsProd(true);
    // }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProd) return;
    
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        setError(error.message ?? "Failed to create account");
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

  if (isProd) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 font-sans">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur rounded-2xl shadow-2xl overflow-hidden p-8">
           <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-3xl">
                🚫
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Access Denied</h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest leading-relaxed">
                  Account creation is disabled in the production environment for security.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl uppercase font-bold tracking-widest border-border hover:bg-muted transition-all">
                <Link href="/">Return to Dashboard</Link>
              </Button>
           </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/20 text-foreground p-4 font-sans">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 p-8 pb-4">
          <div className="flex justify-center mb-6">
            <Link href="/" className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              C
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight uppercase text-center">New Identity</CardTitle>
          <CardDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] text-center">
            Tournament Admin Registration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-4">
          {error && (
            <Badge variant="destructive" className="w-full justify-center mb-8 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest border-none shadow-lg shadow-destructive/20">
              {error}
            </Badge>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
                placeholder="admin@ceta.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Security Key</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : "Create Account"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 p-8 pt-0 text-center">
          <div className="h-px w-full bg-border" />
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Already registered?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Portal Access
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
