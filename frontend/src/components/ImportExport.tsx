import { useState } from 'react';
import { api } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

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
      if (format === 'csv') {
        const response = await api.organizations.get(organizationId);
        const csv = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/export?format=csv`);
        const blob = await csv.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords_${Date.now()}.csv`;
        a.click();
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/export?format=json`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          user_id: 1,
          format: importFormat,
          data: importData,
        }),
      });
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
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={() => handleExport('json')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Export JSON
      </button>
      <button
        onClick={() => handleExport('csv')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Export CSV
      </button>
      <button
        onClick={() => setShowImport(!showImport)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Import
      </button>

      {showImport && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
            }}
          >
            <h2>Import Passwords</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Format:</label>
              <select
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value as 'json' | 'csv')}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Data:</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
                placeholder={importFormat === 'json' ? 'Paste JSON data...' : 'Paste CSV data...'}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportData('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

