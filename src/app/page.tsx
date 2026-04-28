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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            CETA <span className="text-[hsl(280,100%,70%)]">Bracket</span>
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/bracket"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-2xl no-underline transition hover:bg-white/20"
            >
              View Tournament Bracket
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2 mt-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-xl text-white">
                {session && <span>Logged in as Admin ({session.user?.email})</span>}
              </p>
              {!session ? (
                <div className="flex gap-4">
                  <Link href="/login" className="rounded-full bg-white/10 px-6 py-2 font-semibold no-underline transition hover:bg-white/20">
                    Admin Login
                  </Link>
                </div>
              ) : (
                <form>
                  <button
                    className="rounded-full bg-red-500/20 px-6 py-2 font-semibold no-underline transition hover:bg-red-500/40 text-red-200"
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                  >
                    Sign out
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
