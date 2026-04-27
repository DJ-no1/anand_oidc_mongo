type Props = {
  searchParams: Promise<{ error?: string; error_description?: string }>;
};

export default async function OAuthErrorPage({ searchParams }: Props) {
  const q = await searchParams;
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        OAuth or OIDC error screen. Query params from the server will be shown
        here when wired up.
      </p>
      {(q.error || q.error_description) && (
        <pre className="mt-6 overflow-x-auto rounded-[1.25rem] border border-border bg-muted/50 p-4 text-xs text-foreground">
          {JSON.stringify(q, null, 2)}
        </pre>
      )}
    </main>
  );
}
