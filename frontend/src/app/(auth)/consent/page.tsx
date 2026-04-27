export default function ConsentPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Consent</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placeholder. Will load context via{" "}
        <code className="rounded-full bg-muted px-2 py-0.5 text-xs">
          transaction_id
        </code>{" "}
        and call the consent API.
      </p>
    </main>
  );
}
