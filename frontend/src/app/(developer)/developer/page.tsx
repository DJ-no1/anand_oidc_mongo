import Link from "next/link";

export default function DeveloperHomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Developer dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder. Lists OAuth clients you own.
      </p>
      <Link
        href="/developer/apps/new"
        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Register a new application
      </Link>
    </main>
  );
}
