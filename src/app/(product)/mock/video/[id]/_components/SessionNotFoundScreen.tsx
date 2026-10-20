import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { VIDEO_MOCK_NOT_FOUND_CONTENT } from "@/config/content";

interface SessionNotFoundScreenProps {
  onGoBack: () => void;
}

export function SessionNotFoundScreen({
  onGoBack,
}: SessionNotFoundScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glass border-primary/20 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className={cn(dmSans.className, "text-xl font-bold")}>
              {VIDEO_MOCK_NOT_FOUND_CONTENT.TITLE}
            </h2>
            <p className="text-muted-foreground mt-2">
              {VIDEO_MOCK_NOT_FOUND_CONTENT.DESCRIPTION}
            </p>
          </div>
          <Button onClick={onGoBack} className="w-full text-white">
            {VIDEO_MOCK_NOT_FOUND_CONTENT.GO_BACK}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
