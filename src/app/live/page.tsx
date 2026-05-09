import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans relative">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <div className="flex flex-col items-center">
            <h1 className="flex items-center justify-center gap-3 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300">
            <Image
              src="/assets/ceta/CETA-logo-v2025-light.png"
              alt="CETA Logo"
              width={160}
              height={64}
              className="h-[2.2em] w-auto object-contain"
              priority
            />
          </h1>
            <h1 className="text-6xl font-black tracking-tighter uppercase sm:text-[7rem] leading-none">
              CETA
            </h1>
            {/* <p className="text-xl font-black uppercase tracking-[0.4em] pb-4">2026</p> */}
            <div className="bg-foreground text-background px-4 py-1">
              <span className="text-xl font-black uppercase tracking-[0.4em]">@ York Mills CI</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase">
              Watch Live
            </h2>
            <iframe src="https://www.youtube.com/embed/gGcPor_oriM" className="w-25% aspect-video min-w-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
          
            <div className="flex gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto border-2 border-foreground px-12 py-4 text-2xl font-black uppercase tracking-[0.2em]"
              >
                <Link href="/bracket">
                  Classic
                </Link>
              </Button>
              <Button
                asChild
                className="h-auto px-12 py-4 text-2xl font-black uppercase tracking-[0.2em]"
              >
                <Link href="/bracket-svg">
                  SVG View
                </Link>
              </Button>
            </div>




          <div className="flex flex-col items-center gap-6 mt-auto">
            <div className="flex flex-col items-center justify-center gap-6">
              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-foreground/40">
                {session && <span>Logged in as {session.user?.email}</span>}
              </p>
              {!session ? (
                <div className="flex gap-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-foreground/20 text-[10px] font-bold uppercase tracking-widest"
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
                    className="border-foreground/20 text-[10px] font-bold uppercase tracking-widest"
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
