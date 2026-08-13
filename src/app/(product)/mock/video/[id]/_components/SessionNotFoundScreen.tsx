import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface SessionNotFoundScreenProps {
    onGoBack: () => void;
}

export function SessionNotFoundScreen({ onGoBack }: SessionNotFoundScreenProps) {
    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center">
            <Card className="glass border-primary/20 max-w-md w-full mx-4">
                <CardContent className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                        <h2 className={cn(dmSans.className, "text-xl font-bold")}>Session Not Found</h2>
                        <p className="text-muted-foreground mt-2">The interview session you requested could not be found or has no questions.</p>
                    </div>
                    <Button onClick={onGoBack} className="w-full text-white">
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
