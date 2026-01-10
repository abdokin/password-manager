import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Star, AlertTriangle, Copy, Shield, Clock } from 'lucide-react';

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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Search passwords by name, username, URL, or notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={filters.favorite ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('favorite')}
            >
              <Star className="w-4 h-4 mr-1" />
              Favorites
            </Button>
            <Button
              variant={filters.breached ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleFilter('breached')}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Breached
            </Button>
            <Button
              variant={filters.duplicate ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('duplicate')}
            >
              <Copy className="w-4 h-4 mr-1" />
              Duplicates
            </Button>
            <Button
              variant={filters.weak ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleFilter('weak')}
            >
              <Shield className="w-4 h-4 mr-1" />
              Weak
            </Button>
            <Button
              variant={filters.expired ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleFilter('expired')}
            >
              <Clock className="w-4 h-4 mr-1" />
              Expired
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="strength_score">Strength</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
