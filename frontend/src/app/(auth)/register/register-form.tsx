"use client";

import { useMemo, useState } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type Role = "customer" | "seller";

const STEPS = ["Account type", "Profile", "Security"] as const;

function passwordRuleMessage() {
  return "At least 8 characters, one uppercase letter, and one digit.";
}

function validatePassword(value: string): string | null {
  if (value.length < 8) return passwordRuleMessage();
  if (!/(?=.*[A-Z])(?=.*\d)/.test(value)) return passwordRuleMessage();
  return null;
}

export function RegisterForm() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameError = useMemo(() => {
    if (!name.trim()) return "Name is required.";
    if (name.trim().length < 2 || name.trim().length > 50) {
      return "Name must be between 2 and 50 characters.";
    }
    return null;
  }, [name]);

  const emailError = useMemo(() => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Enter a valid email address.";
    }
    return null;
  }, [email]);

  const passwordError = useMemo(
    () => (password ? validatePassword(password) : null),
    [password]
  );

  const confirmError = useMemo(() => {
    if (!confirmPassword) return "Confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return null;
  }, [confirmPassword, password]);

  const canAdvanceFromStep2 = !nameError && !emailError;
  const canSubmit = !passwordError && !confirmError;

  const goNext = () => {
    setFormError(null);
    if (step === 1 && !canAdvanceFromStep2) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setFormError(null);
    if (!canSubmit || nameError || emailError) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: unknown;
      };
      if (!res.ok || json.success === false) {
        setFormError(json.message ?? "Registration failed.");
        return;
      }
      setSuccessMessage(
        json.message ??
          "Registration successful. Check your email to verify your account."
      );
    } catch {
      setFormError(
        "Could not reach the server. Is the API running and NEXT_PUBLIC_API_URL set?"
      );
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>{successMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default" }),
              "inline-flex text-center no-underline"
            )}
          >
            Go to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                i === step
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-transparent bg-muted/60 text-muted-foreground"
              )}
            >
              <span className="me-1.5 tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              {label}
            </span>
          ))}
        </div>
        <CardTitle className="mt-2">Create an account</CardTitle>
        <CardDescription>
          Join as a customer or seller. You will verify your email before
          signing in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError ? (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        ) : null}

        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: "customer" as const,
                  title: "Customer",
                  body: "Use apps and services that sign in with this identity provider.",
                },
                {
                  id: "seller" as const,
                  title: "Seller",
                  body: "Build and offer integrations; manage OAuth clients as a vendor-style account.",
                },
              ] as const
            ).map((opt) => {
              const selected = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-[1.75rem] border bg-muted/30 p-5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-primary/50 bg-primary/10 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/25"
                  )}
                >
                  <span className="font-heading text-base font-semibold">
                    {opt.title}
                  </span>
                  <span className="text-sm text-muted-foreground">{opt.body}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 1 ? (
          <FieldGroup>
            <Field data-invalid={!!nameError}>
              <FieldLabel htmlFor="reg-name">Full name</FieldLabel>
              <Input
                id="reg-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                aria-invalid={!!nameError}
              />
              {nameError ? <FieldError>{nameError}</FieldError> : null}
            </Field>
            <Field data-invalid={!!emailError}>
              <FieldLabel htmlFor="reg-email">Email</FieldLabel>
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!emailError}
              />
              {emailError ? <FieldError>{emailError}</FieldError> : null}
            </Field>
          </FieldGroup>
        ) : null}

        {step === 2 ? (
          <FieldGroup>
            <Field data-invalid={!!passwordError}>
              <FieldLabel htmlFor="reg-password">Password</FieldLabel>
              <Input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
              />
              <FieldDescription>{passwordRuleMessage()}</FieldDescription>
              {passwordError ? <FieldError>{passwordError}</FieldError> : null}
            </Field>
            <Field data-invalid={!!confirmError}>
              <FieldLabel htmlFor="reg-confirm">Confirm password</FieldLabel>
              <Input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!confirmError}
              />
              {confirmError ? <FieldError>{confirmError}</FieldError> : null}
            </Field>
          </FieldGroup>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={loading}
            >
              Back
            </Button>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex text-center no-underline"
              )}
            >
              Have an account?
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {step < 2 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={loading || (step === 1 && !canAdvanceFromStep2)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={loading || !canSubmit}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
