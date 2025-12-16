"use client";

import { format } from "date-fns";
import { Eye, EyeOff, RotateCcw } from "lucide-react";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getPasswordHistory, restorePasswordFromHistory } from "@/lib/tenant-password-history";

interface PasswordHistoryProps {
  passwordId: number;
}

export function PasswordHistory({ passwordId }: PasswordHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, [passwordId]);

  const loadHistory = async () => {
    setLoading(true);
    const result = await getPasswordHistory(passwordId);
    if (result.success) {
      setHistory(result.history);
    }
    setLoading(false);
  };

  const handleRestore = async (historyId: number) => {
    const result = await restorePasswordFromHistory(passwordId, historyId);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: "Password restored",
        description: "Password has been restored from history",
      });
      router.refresh();
    }
  };

  const toggleReveal = (id: number) => {
    const newSet = new Set(revealedPasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedPasswords(newSet);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading history...</div>;
  }

  if (history.length === 0) {
    return <div className="text-sm text-muted-foreground">No password history available</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Password History</h3>
      <div className="space-y-2">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">
                  {revealedPasswords.has(entry.id)
                    ? entry.oldPassword
                    : "•".repeat(entry.oldPassword.length)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleReveal(entry.id)}
                >
                  {revealedPasswords.has(entry.id) ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Changed on {format(new Date(entry.changedAt), "PPp")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleRestore(entry.id)}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
