// Shape actually returned by getPublicVideoInterviews (src/app/actions/video.actions/community.ts).
// Was previously a hand-typed VideoInterview with title/company/role/duration/tags —
// none of those fields exist on MockSession, so the page rendered hardcoded fake
// data instead of ever calling the real action. This matches the real shape.
export interface VideoInterview {
  id: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  difficulty: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export type SortOption = 'recent' | 'popular' | 'trending';
