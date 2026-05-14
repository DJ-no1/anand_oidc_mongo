"use client";

import { useCallback, useState } from "react";
import { Bot, Check, Copy, ExternalLink, Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";

type Props = {
  open: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
};

type ConfigRow = {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
};

/** Tiny copy hook — tracks which key was last copied for 2 s */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, []);

  return { copied, copy };
}

function CopyRow({
  rowKey,
  label,
  value,
  hint,
  mono,
  copied,
  onCopy,
}: ConfigRow & {
  rowKey: string;
  copied: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  const isCopied = copied === rowKey;
  return (
    <div className="group flex flex-col gap-1 rounded-lg border border-border bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={`mt-0.5 break-all text-sm ${mono ? "font-mono text-xs" : ""}`}>
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onCopy(rowKey, value)}
          className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Copy ${label}`}
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export function QuickSetupSheet({ open, projectName, onClose }: Props) {
  const { copied, copy } = useCopy();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedLlm, setCopiedLlm] = useState(false);

  const issuer = getApiBaseUrl();

  const rows: (ConfigRow & { key: string; section?: string })[] = [
    {
      key: "issuer",
      section: "Provider",
      label: "Issuer / Provider URL",
      value: issuer,
      hint: "The base URL of your OIDC provider. Set this as the `issuer` in your SDK.",
      mono: true,
    },
    {
      key: "discovery",
      label: "Discovery Document",
      value: `${issuer}/.well-known/openid-configuration`,
      hint: "Auto-configures most OIDC SDKs. Paste this as the `issuerUrl` or `wellKnownUrl`.",
      mono: true,
    },
    {
      key: "auth",
      label: "Authorization Endpoint",
      value: `${issuer}/oauth/authorize`,
      hint: "Redirect your users here to start the login flow.",
      mono: true,
    },
    {
      key: "token",
      label: "Token Endpoint",
      value: `${issuer}/oauth/token`,
      hint: "Exchange the authorization code for access & ID tokens.",
      mono: true,
    },
    {
      key: "userinfo",
      label: "UserInfo Endpoint",
      value: `${issuer}/oauth/userinfo`,
      hint: "Fetch the authenticated user's profile using the access token.",
      mono: true,
    },
    {
      key: "jwks",
      label: "JWKS URI",
      value: `${issuer}/oauth/jwks`,
      hint: "JSON Web Key Set for verifying ID token signatures.",
      mono: true,
    },
    {
      key: "redirect",
      section: "Your App",
      label: "Callback / Redirect URI",
      value: "https://your-app.com/auth/callback",
      hint: 'Register this exact URI in your OAuth client\'s "Redirect URIs". Must match exactly.',
      mono: true,
    },
    {
      key: "scopes",
      label: "Recommended Scopes",
      value: "openid profile email",
      hint: "`openid` is required. Add `profile` for name/picture and `email` for the email address.",
    },
    {
      key: "response_type",
      label: "Response Type",
      value: "code",
      hint: "Use the Authorization Code flow (`response_type=code`) for server-side apps.",
    },
    {
      key: "grant_type",
      label: "Grant Type",
      value: "authorization_code",
      hint: "Use on the token endpoint to exchange the code for tokens.",
    },
  ];

  // Group rows by section
  const sections: { title: string | null; rows: typeof rows }[] = [];
  let currentSection: { title: string | null; rows: typeof rows } = {
    title: null,
    rows: [],
  };
  for (const row of rows) {
    if (row.section && row.section !== currentSection.title) {
      if (currentSection.rows.length) sections.push(currentSection);
      currentSection = { title: row.section, rows: [row] };
    } else {
      currentSection.rows.push(row);
    }
  }
  if (currentSection.rows.length) sections.push(currentSection);

  /** Plain-text dump of every label=value pair */
  const buildCopyAll = () =>
    rows
      .map((r) => `${r.label}: ${r.value}`)
      .join("\n");

  /** Rich LLM prompt — never rendered in the UI */
  const buildLlmPrompt = () => `
I am integrating OIDC / OAuth 2.0 into my application using the following provider configuration.
Project: ${projectName}

=== OIDC Provider Configuration ===
Issuer URL:               ${issuer}
Discovery Document:       ${issuer}/.well-known/openid-configuration
Authorization Endpoint:   ${issuer}/oauth/authorize
Token Endpoint:           ${issuer}/oauth/token
UserInfo Endpoint:        ${issuer}/oauth/userinfo
JWKS URI:                 ${issuer}/oauth/jwks

=== Integration Parameters ===
Response Type:            code
Grant Type:               authorization_code
Recommended Scopes:       openid profile email
Callback / Redirect URI:  https://your-app.com/auth/callback  ← replace with your real URL

=== Notes ===
- The Discovery Document auto-populates all endpoints in most OIDC SDKs (NextAuth, Auth.js, Passport-OpenIDConnect, etc.).
- "client_id" and "client_secret" are per-OAuth-client (not shown here). You will find them after creating a client in the project dashboard.
- Redirect URIs must be registered exactly as they appear in the authorization request.
- Use PKCE (code_challenge / code_verifier) for public clients (SPAs, mobile apps).

Please help me integrate this OIDC provider into my application.
`.trim();

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyAll());
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleCopyLlm = async () => {
    try {
      await navigator.clipboard.writeText(buildLlmPrompt());
      setCopiedLlm(true);
      setTimeout(() => setCopiedLlm(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-sheet-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 className="size-4" />
            </div>
            <div>
              <h2 id="setup-sheet-title" className="text-base font-semibold leading-tight">
                Quick Setup
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Integration config for{" "}
                <span className="font-medium text-foreground">{projectName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-5 text-sm text-muted-foreground">
            Copy these values into your app or OIDC SDK. Client ID and secret are
            per-client — create or rotate them from the project dashboard.
          </p>

          <div className="flex flex-col gap-6">
            {sections.map((section, si) => (
              <div key={si}>
                {section.title ? (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {section.title}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2">
                  {section.rows.map((row) => (
                    <CopyRow
                      key={row.key}
                      rowKey={row.key}
                      label={row.label}
                      value={row.value}
                      hint={row.hint}
                      mono={row.mono}
                      copied={copied}
                      onCopy={copy}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Discovery doc link */}
          <div className="mt-6 rounded-lg border border-border bg-muted/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Most modern OIDC libraries (NextAuth, Auth.js, Passport, etc.) only need the{" "}
              <strong className="text-foreground">Discovery Document</strong> URL — it
              auto-discovers all endpoints automatically.
            </p>
            <a
              href={`${issuer}/.well-known/openid-configuration`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary underline-offset-4 hover:underline"
            >
              View discovery document
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Footer — three action buttons */}
        <div className="flex flex-col gap-2 border-t border-border px-6 py-4">
          {/* Row 1: Copy all + Copy for LLM */}
          <div className="flex gap-2">
            {/* Copy all */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyAll}
            >
              {copiedAll ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
              {copiedAll ? "Copied!" : "Copy all"}
            </Button>

            {/* Copy for LLM — green accent, no preview text */}
            <Button
              type="button"
              variant="outline"
              className={`flex-1 gap-2 border-emerald-600/40 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 ${
                copiedLlm ? "border-emerald-500 bg-emerald-500/10" : ""
              }`}
              onClick={handleCopyLlm}
            >
              {copiedLlm ? (
                <Check className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
              {copiedLlm ? "Copied!" : "Copy for LLM"}
            </Button>
          </div>

          {/* Row 2: Close */}
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
