"use client";

import { Eye, EyeOff, KeyRound, Lock, Shield } from "lucide-react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

interface PasswordUnlockCardProps {
  slug: string;
  onUnlock: (password: string) => Promise<boolean>;
}

export function PasswordUnlockCard({
  slug,
  onUnlock,
}: PasswordUnlockCardProps) {
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the password");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ok = await onUnlock(password.trim());
      if (!ok) {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Error unlocking paste. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto my-12 border-border/80 shadow-md">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-6" />
        </div>
        <CardTitle className="text-xl">Password Protected</CardTitle>
        <CardDescription>
          This paste requires a password to view. Enter the password below to
          unlock it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="paste-passphrase">Password</FieldLabel>
              <div className="relative flex items-center">
                <Input
                  id="paste-passphrase"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <FieldDescription>
                Snippet: <code className="font-mono text-xs">{slug}</code>
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={loading} className="w-full">
            <KeyRound className="size-4" data-icon="inline-start" />
            {loading ? "Unlocking..." : "Unlock Paste"}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Shield className="size-3.5 text-muted-foreground" />
            <span>Encrypted and secured</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
