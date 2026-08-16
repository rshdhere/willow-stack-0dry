import { FlappyGame } from "@/components/flappy-game";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 py-8 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(125,211,252,0.25),_transparent_70%)]" />
      </div>

      <header className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
          Willow Arcade
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Flappy Bird
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          Keep the bird airborne, thread the pipes, and chase a new high score.
        </p>
      </header>

      <FlappyGame />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Controls: click / tap · Space · ↑ · Enter to restart
      </footer>
    </main>
  );
}
