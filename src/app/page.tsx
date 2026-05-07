import Hero from "./hero";
import Info from "./info";
import Navbar from "./nav";

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-slate-200 selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-zinc-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-neutral-500/10 blur-[120px]" />
        <div className="absolute left-[50%] top-[40%] h-[30%] w-[30%] -translate-x-1/2 rounded-full bg-slate-300/5 blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-between">
        <section id="home" className="w-full">
          <Hero />
        </section>

        <section id="info" className="w-full">
          <Info />
        </section>
      </main>
    </div>
  );
}
