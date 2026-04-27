type Props = {
  searchParams: Promise<{ error?: string; error_description?: string }>;
};

export default async function OAuthErrorPage({ searchParams }: Props) {
  const q = await searchParams;
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        OAuth or OIDC error screen. Query params from the server will be shown
        here when wired up.
      </p>
      {(q.error || q.error_description) && (
        <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {JSON.stringify(q, null, 2)}
        </pre>
      )}
    </main>
  );
}
