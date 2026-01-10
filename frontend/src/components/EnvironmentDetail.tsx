import { useState } from 'react';
import { useEnvironment, useAddEnvironmentVariable, useGetEnvironmentVariable } from '@/hooks/useEnvironments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Lock, Eye, EyeOff, Copy, Trash2, Edit } from 'lucide-react';

interface EnvironmentDetailProps {
  organizationId: number;
  environmentId: number;
}

export default function EnvironmentDetail({ organizationId, environmentId }: EnvironmentDetailProps) {
  const { data: environment, isLoading } = useEnvironment(organizationId, environmentId);
  const addVariable = useAddEnvironmentVariable();
  const getVariable = useGetEnvironmentVariable();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [revealedValues, setRevealedValues] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    encrypted: false,
    description: '',
  });

  const handleAddVariable = async () => {
    try {
      await addVariable.mutateAsync({
        organizationId,
        environmentId,
        key: formData.key,
        value: formData.value,
        encrypted: formData.encrypted,
      });
      setShowAddDialog(false);
      setFormData({ key: '', value: '', encrypted: false, description: '' });
    } catch (error) {
      console.error('Failed to add variable:', error);
    }
  };

  const handleRevealValue = async (key: string) => {
    if (revealedValues.has(key)) {
      setRevealedValues(new Set([...revealedValues].filter(k => k !== key)));
      return;
    }

    try {
      await getVariable.mutateAsync({
        organizationId,
        environmentId,
        key,
      });
      setRevealedValues(new Set([...revealedValues, key]));
    } catch (error) {
      console.error('Failed to get variable:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading environment...</div>;
  }

  if (!environment) {
    return <div className="p-8 text-center">Environment not found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{environment.name}</h1>
          <p className="text-muted-foreground mt-1">{environment.description || 'Manage environment variables'}</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Variable
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Environment Variable</DialogTitle>
              <DialogDescription>Add a new variable to this environment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., DATABASE_URL"
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter the value"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="encrypted"
                  checked={formData.encrypted}
                  onChange={(e) => setFormData({ ...formData, encrypted: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="encrypted" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="w-4 h-4" />
                  Encrypt this value
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVariable} disabled={!formData.key || !formData.value || addVariable.isPending}>
                {addVariable.isPending ? 'Adding...' : 'Add Variable'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Manage variables for this environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {environment.environment_variables?.map((variable) => (
                  <div
                    key={variable.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold">{variable.key}</code>
                        {variable.encrypted && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {revealedValues.has(variable.key)
                          ? getVariable.data?.value || variable.value
                          : variable.encrypted
                          ? '••••••••'
                          : variable.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevealValue(variable.key)}
                      >
                        {revealedValues.has(variable.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(revealedValues.has(variable.key) ? (getVariable.data?.value || variable.value) : variable.value)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!environment.environment_variables || environment.environment_variables.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No variables yet. Add your first variable to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage who can access this environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {environment.environment_accesses?.map((access) => (
                  <div key={access.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{access.user?.email || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{access.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

