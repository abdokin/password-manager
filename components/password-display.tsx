"use client";

import { Check, Copy, Eye, EyeOff } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export function PasswordDisplay({ password }: { password: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <p className="font-mono text-lg">{showPassword ? password : "•".repeat(password.length)}</p>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setShowPassword(!showPassword)}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
