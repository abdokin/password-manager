"use client";

import { Check, Copy, RefreshCw } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type PasswordGeneratorOptions,
  defaultPasswordOptions,
  generatePassword,
  getPasswordStrength,
} from "@/lib/password-generator";

export function PasswordGenerator({
  onPasswordGenerated,
}: {
  onPasswordGenerated?: (password: string) => void;
}) {
  const [options, setOptions] = useState<PasswordGeneratorOptions>(defaultPasswordOptions);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const password = generatePassword(options);
    setGeneratedPassword(password);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUsePassword = () => {
    if (generatedPassword && onPasswordGenerated) {
      onPasswordGenerated(generatedPassword);
    }
  };

  const strength = generatedPassword ? getPasswordStrength(generatedPassword) : null;

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "fair":
        return "bg-orange-500";
      case "good":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      case "very-strong":
        return "bg-green-600";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Generate Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input value={generatedPassword} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy password">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {strength && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Strength: {strength.strength}</span>
                    <span>{strength.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor(strength.strength)}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Entropy: {strength.entropy} bits</p>
                </div>
              )}
            </div>
          )}

          {/* Length */}
          <div className="space-y-2">
            <Label htmlFor="length">Length: {options.length} characters</Label>
            <Input
              id="length"
              type="range"
              min="8"
              max="128"
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            />
          </div>

          {/* Character Sets */}
          <div className="space-y-2">
            <Label>Character Sets</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeUppercase: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeLowercase: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Lowercase (a-z)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeNumbers: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Numbers (0-9)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeSymbols: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Symbols (!@#$%...)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      excludeAmbiguous: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Exclude ambiguous (0, O, 1, l, I)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
            {generatedPassword && onPasswordGenerated && (
              <Button onClick={handleUsePassword} variant="outline">
                Use Password
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
