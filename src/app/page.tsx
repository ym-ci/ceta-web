import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

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
            <Link
              href="/bracket"
              className="border-2 border-white px-12 py-4 font-black text-2xl uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black"
            >
              Enter Tournament
            </Link>
          </div>

          <div className="flex flex-col items-center gap-6 mt-20">
            <div className="flex flex-col items-center justify-center gap-6">
              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-white/40">
                {session && <span>Admin Session: {session.user?.email}</span>}
              </p>
              {!session ? (
                <div className="flex gap-4">
                  <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-6 py-2 hover:border-white transition-colors">
                    Admin Portal
                  </Link>
                </div>
              ) : (
                <form>
                  <button
                    className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-6 py-2 hover:bg-white hover:text-black transition-all"
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                  >
                    Terminate Session
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
