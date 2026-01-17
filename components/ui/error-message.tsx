import { AlertCircle, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ title, message, onDismiss, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-500/20 bg-red-500/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">{title}</h3>}
          <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
