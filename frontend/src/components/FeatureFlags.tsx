import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface FeatureFlagsProps {
  organizationId?: number;
}

export default function FeatureFlags({ organizationId }: FeatureFlagsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'enabled' | 'disabled'>('disabled');
  const queryClient = useQueryClient();

  const { flags, isLoading } = useFeatureFlags(organizationId);

  const createFlag = useMutation({
    mutationFn: (data: any) => api.featureFlags.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_flags', organizationId] });
      setShowCreateDialog(false);
      setKey('');
      setName('');
      setDescription('');
      setCategory('');
      setStatus('disabled');
    },
  });

  const toggleFlag = useMutation({
    mutationFn: ({ key, status }: { key: string; status: string }) => api.featureFlags.toggle(key, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_flags', organizationId] });
    },
  });

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      case 'experimental':
        return 'bg-purple-100 text-purple-800';
      case 'production':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading feature flags...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">Manage feature toggles and rollouts</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>Add a new feature flag to control feature rollouts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g., enable_new_dashboard"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enable New Dashboard"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of what this flag controls"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as 'enabled' | 'disabled')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  createFlag.mutate({
                    key,
                    name,
                    description,
                    category,
                    status,
                  })
                }
                disabled={!key || !name || createFlag.isPending}
              >
                {createFlag.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flags.map((flag) => (
          <Card key={flag.key} className={flag.enabled ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{flag.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    toggleFlag.mutate({
                      key: flag.key,
                      status: flag.enabled ? 'disabled' : 'enabled',
                    })
                  }
                >
                  {flag.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(flag.category)}`}>
                  {flag.category || 'general'}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{flag.description || 'No description'}</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{flag.key}</code>
            </CardContent>
          </Card>
        ))}
        {flags.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No feature flags yet. Create your first flag to get started.
          </div>
        )}
      </div>
    </div>
  );
}

