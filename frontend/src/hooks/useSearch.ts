import { useState, useMemo } from 'react';
import type { Password } from '@/types';

export function useSearch(passwords: Password[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    favorite: false,
    breached: false,
    duplicate: false,
    weak: false,
    expired: false,
  });
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'strength_score'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredPasswords = useMemo(() => {
    let filtered = passwords;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.username.toLowerCase().includes(term) ||
          p.url?.toLowerCase().includes(term) ||
          p.notes?.toLowerCase().includes(term)
      );
    }

    if (filters.favorite) {
      filtered = filtered.filter((p) => p.favorite);
    }
    if (filters.breached) {
      filtered = filtered.filter((p) => p.is_breached);
    }
    if (filters.duplicate) {
      filtered = filtered.filter((p) => p.is_duplicate);
    }
    if (filters.weak) {
      filtered = filtered.filter((p) => p.is_weak);
    }
    if (filters.expired) {
      filtered = filtered.filter((p) => p.expires_at && new Date(p.expires_at) < new Date());
    }

    return filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (sortBy === 'name') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [passwords, searchTerm, filters, sortBy, sortDirection]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredPasswords,
  };
}

