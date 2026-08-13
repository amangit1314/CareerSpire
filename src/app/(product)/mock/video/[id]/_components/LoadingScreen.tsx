import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Preparing your interview...</p>
            </div>
        </div>
    );
}
