export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder. Will post credentials to the backend and honor{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">
          return_to
        </code>{" "}
        for the authorize flow.
      </p>
    </main>
  );
}
