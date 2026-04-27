import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Auth & OIDC",
    description: "Login, registration, consent, and OAuth error routes.",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
      { href: "/consent", label: "Consent" },
      { href: "/error", label: "OAuth error" },
    ],
  },
  {
    title: "Developer",
    description: "OAuth clients you register and manage.",
    links: [
      { href: "/developer", label: "Dashboard" },
      { href: "/developer/apps/new", label: "New app" },
      { href: "/developer/apps/demo-client", label: "App detail (demo id)" },
    ],
  },
  {
    title: "Admin",
    description: "Server-wide apps and users (admin role).",
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
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          OIDC console
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Identity console: open each route below while APIs and flows are wired
          up. Use{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Register
          </Link>{" "}
          to hit the live signup API when the backend is running.
        </p>
      </header>
      <div className="flex flex-col gap-6">
        {sections.map((section, index) => (
          <div key={section.title} className="flex flex-col gap-6">
            {index > 0 ? <Separator /> : null}
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {section.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" }),
                      "h-auto justify-start px-0 py-1"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
