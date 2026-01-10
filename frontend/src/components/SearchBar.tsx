import type { Password } from '@/types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    favorite: boolean;
    breached: boolean;
    duplicate: boolean;
    weak: boolean;
    expired: boolean;
  };
  onFilterChange: (filters: SearchBarProps['filters']) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (dir: 'asc' | 'desc') => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
}: SearchBarProps) {
  const toggleFilter = (key: keyof typeof filters) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => toggleFilter('favorite')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filters.favorite ? '#ffc107' : '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⭐ Favorites
          </button>
          <button
            onClick={() => toggleFilter('breached')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filters.breached ? '#dc3545' : '#fff',
              color: filters.breached ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⚠️ Breached
          </button>
          <button
            onClick={() => toggleFilter('duplicate')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filters.duplicate ? '#ffc107' : '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🔄 Duplicates
          </button>
          <button
            onClick={() => toggleFilter('weak')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filters.weak ? '#dc3545' : '#fff',
              color: filters.weak ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⚠️ Weak
          </button>
          <button
            onClick={() => toggleFilter('expired')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filters.expired ? '#dc3545' : '#fff',
              color: filters.expired ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⏰ Expired
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="created_at">Date</option>
            <option value="name">Name</option>
            <option value="strength_score">Strength</option>
          </select>
          <button
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '0.5rem',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  );
}

