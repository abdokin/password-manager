import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOrganizations } from '@/hooks/useOrganizations';
import { usePasswords } from '@/hooks/usePasswords';
import { useEnvironments } from '@/hooks/useEnvironments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, Server, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: organizations = [] } = useOrganizations();
  const { data: passwords = [] } = usePasswords();
  const selectedOrgId = organizations[0]?.id || 1;
  const { data: environments = [] } = useEnvironments(selectedOrgId);

  const stats = {
    totalPasswords: passwords.length,
    favorites: passwords.filter((p) => p.favorite).length,
    breached: passwords.filter((p) => p.is_breached).length,
    duplicates: passwords.filter((p) => p.is_duplicate).length,
    weak: passwords.filter((p) => p.is_weak).length,
    expired: passwords.filter((p) => p.expires_at && new Date(p.expires_at) < new Date()).length,
    organizations: organizations.length,
    environments: environments.length,
    totalVariables: environments.reduce((sum, env) => sum + (env.environment_variables?.length || 0), 0),
  };

  const securityScore = calculateSecurityScore(stats);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your password and environment management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Passwords"
          value={stats.totalPasswords}
          icon={<Lock className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatCard
          title="Favorites"
          value={stats.favorites}
          icon={<Shield className="w-5 h-5" />}
          color="text-yellow-600"
        />
        <StatCard
          title="Environments"
          value={stats.environments}
          icon={<Server className="w-5 h-5" />}
          color="text-green-600"
        />
        <StatCard
          title="Security Score"
          value={`${securityScore}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color={securityScore > 80 ? 'text-green-600' : securityScore > 60 ? 'text-yellow-600' : 'text-red-600'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AlertCard
          title="Breached"
          count={stats.breached}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
        <AlertCard
          title="Duplicates"
          count={stats.duplicates}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
        />
        <AlertCard
          title="Weak Passwords"
          count={stats.weak}
          icon={<Shield className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
        <AlertCard
          title="Expired"
          count={stats.expired}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>Total variables across all environments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVariables}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Variables stored in {stats.environments} environments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Organizations
            </CardTitle>
            <CardDescription>Teams and organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.organizations}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Active organizations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AlertCard({
  title,
  count,
  icon,
  color,
  bgColor,
  borderColor,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <Card className={`${bgColor} border-2 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{count}</div>
      </CardContent>
    </Card>
  );
}

function calculateSecurityScore(stats: any): number {
  if (stats.totalPasswords === 0) return 100;
  const issues = stats.breached + stats.duplicates + stats.weak + stats.expired;
  const score = 100 - (issues / stats.totalPasswords) * 100;
  return Math.max(0, Math.round(score));
}
