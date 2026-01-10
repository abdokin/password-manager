import { useState } from 'react';
import { useEnvironments, useCreateEnvironment } from '@/hooks/useEnvironments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Server, Lock, Users } from 'lucide-react';
import type { Environment } from '@/types/environment';

interface EnvironmentsListProps {
  organizationId: number;
}

export default function EnvironmentsList({ organizationId }: EnvironmentsListProps) {
  const { data: environments = [], isLoading } = useEnvironments(organizationId);
  const createEnvironment = useCreateEnvironment();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    environment_type: 'development' as Environment['environment_type'],
    description: '',
  });

  const handleCreate = async () => {
    try {
      await createEnvironment.mutateAsync({
        organizationId,
        data: formData,
      });
      setShowCreateDialog(false);
      setFormData({ name: '', environment_type: 'development', description: '' });
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const getTypeColor = (type: Environment['environment_type']) => {
    switch (type) {
      case 'production':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'test':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading environments...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Environments</h1>
          <p className="text-muted-foreground mt-1">Manage environment variables and secrets for your team</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Environment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Environment</DialogTitle>
              <DialogDescription>Create a new environment for managing variables and secrets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Production, Staging"
                />
              </div>
              <div>
                <Label htmlFor="type">Environment Type</Label>
                <Select
                  value={formData.environment_type}
                  onValueChange={(value) => setFormData({ ...formData, environment_type: value as Environment['environment_type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || createEnvironment.isPending}>
                {createEnvironment.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environments.map((env) => (
          <Card key={env.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {env.name}
                </CardTitle>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(env.environment_type)}`}>
                  {env.environment_type}
                </span>
              </div>
              {env.description && <CardDescription>{env.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>{env.environment_variables?.length || 0} variables</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{env.environment_accesses?.length || 0} users</span>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = `/environments/${env.id}`}>
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {environments.length === 0 && (
        <div className="text-center py-12">
          <Server className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No environments yet</h3>
          <p className="text-muted-foreground mb-4">Create your first environment to start managing variables and secrets</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Environment
          </Button>
        </div>
      )}
    </div>
  );
}

