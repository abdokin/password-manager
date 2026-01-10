import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Key, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiKeysProps {
  organizationId?: number;
}

export default function ApiKeys({ organizationId }: ApiKeysProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [name, setName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api_keys', organizationId],
    queryFn: () => api.apiKeys.list(organizationId),
  });

  const createKey = useMutation({
    mutationFn: (data: { name: string; organization_id?: number }) => api.apiKeys.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api_keys', organizationId] });
      setShowCreateDialog(false);
      setName('');
      setRevealedKeys(new Set([...revealedKeys, data.id]));
    },
  });

  const revokeKey = useMutation({
    mutationFn: (key: string) => api.apiKeys.revoke(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys', organizationId] });
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading API keys...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage API keys for programmatic access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Generate a new API key for programmatic access</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production API Key"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createKey.mutate({ name, organization_id: organizationId })} disabled={!name || createKey.isPending}>
                {createKey.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>Your API keys for programmatic access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.map((key: any) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{key.name}</span>
                    {key.revoked_at && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Revoked</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {revealedKeys.has(key.id) ? (
                      <div className="space-y-1">
                        <div>Key: {key.key}</div>
                        <div>Secret: {key.secret}</div>
                      </div>
                    ) : (
                      <div>Key: ••••••••••••••••••••••••••••••••</div>
                    )}
                  </div>
                  {key.created_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newRevealed = new Set(revealedKeys);
                      if (newRevealed.has(key.id)) {
                        newRevealed.delete(key.id);
                      } else {
                        newRevealed.add(key.id);
                      }
                      setRevealedKeys(newRevealed);
                    }}
                  >
                    {revealedKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {revealedKeys.has(key.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(key.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  {!key.revoked_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Revoke this API key?')) {
                          revokeKey.mutate(key.key);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {apiKeys.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No API keys yet. Create your first API key to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

