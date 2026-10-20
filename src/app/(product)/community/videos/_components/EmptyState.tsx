import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Search } from "lucide-react";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { VIDEO_EMPTY_STATE_CONTENT } from "@/config/content";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <Card className="glass border-primary/10">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Search className="h-10 w-10 text-primary" />
        </div>
        <h3 className={cn(dmSans.className, "text-2xl font-semibold mb-3")}>
          {VIDEO_EMPTY_STATE_CONTENT.TITLE}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {VIDEO_EMPTY_STATE_CONTENT.DESCRIPTION}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClearFilters}>
            {VIDEO_EMPTY_STATE_CONTENT.CLEAR_FILTERS}
          </Button>
          <Button asChild>
            <Link href={ROUTES.MOCK_VIDEO} className="dark:text-white">
              <Play className="h-4 w-4 mr-2" />
              {VIDEO_EMPTY_STATE_CONTENT.RECORD_YOUR_OWN}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
