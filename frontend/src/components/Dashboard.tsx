import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOrganizations } from '@/hooks/useOrganizations';
import { usePasswords } from '@/hooks/usePasswords';

export default function Dashboard() {
  const { data: organizations = [] } = useOrganizations();
  const { data: passwords = [] } = usePasswords();

  const stats = {
    totalPasswords: passwords.length,
    favorites: passwords.filter((p) => p.favorite).length,
    breached: passwords.filter((p) => p.is_breached).length,
    duplicates: passwords.filter((p) => p.is_duplicate).length,
    weak: passwords.filter((p) => p.is_weak).length,
    expired: passwords.filter((p) => p.expires_at && new Date(p.expires_at) < new Date()).length,
    organizations: organizations.length,
  };

  const securityScore = calculateSecurityScore(stats);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Passwords" value={stats.totalPasswords} color="#007bff" />
        <StatCard title="Favorites" value={stats.favorites} color="#ffc107" />
        <StatCard title="Organizations" value={stats.organizations} color="#17a2b8" />
        <StatCard title="Security Score" value={`${securityScore}%`} color={securityScore > 80 ? '#28a745' : securityScore > 60 ? '#ffc107' : '#dc3545'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <AlertCard title="⚠️ Breached" count={stats.breached} color="#dc3545" />
        <AlertCard title="🔄 Duplicates" count={stats.duplicates} color="#ffc107" />
        <AlertCard title="⚠️ Weak Passwords" count={stats.weak} color="#dc3545" />
        <AlertCard title="⏰ Expired" count={stats.expired} color="#dc3545" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

function AlertCard({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: count > 0 ? `${color}15` : '#f8f9fa',
        borderRadius: '8px',
        border: `1px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', color }}>{count}</div>
    </div>
  );
}

function calculateSecurityScore(stats: any): number {
  if (stats.totalPasswords === 0) return 100;
  const issues = stats.breached + stats.duplicates + stats.weak + stats.expired;
  const score = 100 - (issues / stats.totalPasswords) * 100;
  return Math.max(0, Math.round(score));
}

