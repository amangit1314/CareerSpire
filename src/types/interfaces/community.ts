// Community hub interfaces (src/app/(product)/community/). Part of the
// `interfaces/` split — see `interfaces/index.ts`.

import type { CommunityContentType, CommunityOutcome } from "../enums";

/** Filter state for the community feed (src/app/(product)/community/_components/CommunityFilters.tsx). */
export interface CommunityFilterState {
  type: CommunityContentType;
  company: string;
  outcome: CommunityOutcome;
  search: string;
}

/** Shape returned by getPublicVideoInterviews (src/app/actions/video.actions/community.ts). */
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
