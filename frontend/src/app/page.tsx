import Link from "next/link";

const sections = [
  {
    title: "Auth & OIDC",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
      { href: "/consent", label: "Consent" },
      { href: "/error", label: "OAuth error" },
    ],
  },
  {
    title: "Developer",
    links: [
      { href: "/developer", label: "Dashboard" },
      { href: "/developer/apps/new", label: "New app" },
      { href: "/developer/apps/demo-client", label: "App detail (demo id)" },
    ],
  },
  {
    title: "Admin",
    links: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/apps", label: "All apps" },
      { href: "/admin/apps/demo-client", label: "App (demo id)" },
      { href: "/admin/users", label: "Users" },
    ],
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          OIDC console
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Next.js frontend scaffold. Use the links below to open each route
          while we wire APIs and UI.
        </p>
      </header>
      <nav className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              {section.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {section.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
