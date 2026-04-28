import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white font-sans">
        <div className="container flex flex-col items-center justify-center gap-16 px-4 py-16">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-6xl font-black tracking-tighter uppercase sm:text-[7rem] leading-none">
              CETA
            </h1>
            <div className="bg-white text-black px-4 py-1">
              <span className="text-xl font-black uppercase tracking-[0.4em]">Bracket</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <Button
              asChild
              variant="outline"
              className="h-auto border-2 border-white px-12 py-4 text-2xl font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black"
            >
              <Link href="/bracket">
                Enter Tournament
              </Link>
            </Button>
          </div>

          <div className="flex flex-col items-center gap-6 mt-20">
            <div className="flex flex-col items-center justify-center gap-6">
              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-white/40">
                {session && <span>Admin Session: {session.user?.email}</span>}
              </p>
              {!session ? (
                <div className="flex gap-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-[10px] font-bold uppercase tracking-widest hover:border-white"
                  >
                    <Link href="/login">
                      Admin Portal
                    </Link>
                  </Button>
                </div>
              ) : (
                <form>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black"
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                  >
                    Terminate Session
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
