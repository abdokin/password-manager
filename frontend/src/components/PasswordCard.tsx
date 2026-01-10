import type { Password } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, AlertTriangle } from 'lucide-react';

interface PasswordCardProps {
  password: Password;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function PasswordCard({ password, onEdit, onDelete, onToggleFavorite }: PasswordCardProps) {
  const getStrengthColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 80) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{password.name}</CardTitle>
          <button
            onClick={onToggleFavorite}
            className="text-2xl hover:scale-110 transition-transform"
          >
            <Star className={password.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Username: {password.username}</div>
          {password.url && (
            <div className="flex items-center gap-2">
              URL:{' '}
              <a
                href={password.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {password.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Strength:</span>
          <span className={`font-bold ${getStrengthColor(password.strength_score)}`}>
            {getStrengthLabel(password.strength_score)} ({password.strength_score})
          </span>
        </div>

        {(password.is_breached || password.is_duplicate || password.is_weak) && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {password.is_breached && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Breached
              </span>
            )}
            {password.is_duplicate && (
              <span className="text-yellow-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Duplicate
              </span>
            )}
            {password.is_weak && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Weak
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="secondary" onClick={onEdit} className="flex-1">
          Edit
        </Button>
        <Button variant="destructive" onClick={onDelete} className="flex-1">
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
