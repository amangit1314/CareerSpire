import { Loader2 } from "lucide-react";
import { VIDEO_MOCK_LOADING_CONTENT } from "@/config/content";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          {VIDEO_MOCK_LOADING_CONTENT.MESSAGE}
        </p>
      </div>
    </div>
  );
}
