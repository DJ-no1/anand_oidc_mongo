type Props = { params: Promise<{ id: string }> };

export default async function DeveloperAppDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Application</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Client <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">{id}</code>
        . Placeholder for client id, secret rotation, and redirect URIs.
      </p>
    </main>
  );
}
