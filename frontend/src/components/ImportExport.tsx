import { useState } from 'react';
import { api } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload } from 'lucide-react';

interface ImportExportProps {
  organizationId: number;
}

export default function ImportExport({ organizationId }: ImportExportProps) {
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/export?format=${format}`
      );
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords_${Date.now()}.csv`;
        a.click();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords_${Date.now()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('Please paste import data');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/import`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: organizationId,
            user_id: 1,
            format: importFormat,
            data: importData,
          }),
        }
      );
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      alert(`Imported ${result.imported} passwords. ${result.errors.length > 0 ? `Errors: ${result.errors.length}` : ''}`);
      setShowImport(false);
      setImportData('');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => handleExport('json')}>
        <Download className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button variant="outline" onClick={() => handleExport('csv')}>
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Passwords</DialogTitle>
            <DialogDescription>Import passwords from JSON or CSV format</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={importFormat} onValueChange={(value) => setImportFormat(value as 'json' | 'csv')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Textarea
                id="data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder={importFormat === 'json' ? 'Paste JSON data...' : 'Paste CSV data...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
