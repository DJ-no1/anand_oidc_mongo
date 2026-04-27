import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in with your verified account. This form will post credentials
            and honor{" "}
            <code className="rounded-full bg-muted px-2 py-0.5 text-xs">
              return_to
            </code>{" "}
            for the authorize flow once wired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
              />
              <FieldDescription>
                Placeholder fields only; submit handler not connected yet.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "inline-flex text-center no-underline"
            )}
          >
            Create an account
          </Link>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex text-center no-underline"
              )}
            >
              Back
            </Link>
            <Button type="button" disabled>
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
