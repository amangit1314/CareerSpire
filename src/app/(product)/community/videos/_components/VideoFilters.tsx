import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ANY_DIFFICULTY,
  Difficulty,
  VideoSortOption,
  type AnyDifficulty,
} from "@/types";
import { VIDEO_FILTERS_CONTENT } from "@/config/content";

interface VideoFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: AnyDifficulty | Difficulty;
  onDifficultyChange: (value: AnyDifficulty | Difficulty) => void;
  sortBy: VideoSortOption;
  onSortChange: (value: VideoSortOption) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (value: DateRange | undefined) => void;
}

export function VideoFilters({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
}: VideoFiltersProps) {
  return (
    <Card className="glass border-primary/10 mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={VIDEO_FILTERS_CONTENT.SEARCH_PLACEHOLDER}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <Select
              value={difficultyFilter}
              onValueChange={(value) =>
                onDifficultyChange(value as AnyDifficulty | Difficulty)
              }
            >
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue
                  placeholder={VIDEO_FILTERS_CONTENT.DIFFICULTY_PLACEHOLDER}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_DIFFICULTY}>
                  {VIDEO_FILTERS_CONTENT.ALL_DIFFICULTIES}
                </SelectItem>
                <SelectItem value={Difficulty.EASY}>
                  {VIDEO_FILTERS_CONTENT.DIFFICULTY_EASY}
                </SelectItem>
                <SelectItem value={Difficulty.MEDIUM}>
                  {VIDEO_FILTERS_CONTENT.DIFFICULTY_MEDIUM}
                </SelectItem>
                <SelectItem value={Difficulty.HARD}>
                  {VIDEO_FILTERS_CONTENT.DIFFICULTY_HARD}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Select
              value={sortBy}
              onValueChange={(value) => onSortChange(value as VideoSortOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={VIDEO_FILTERS_CONTENT.SORT_PLACEHOLDER}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VideoSortOption.RECENT}>
                  {VIDEO_FILTERS_CONTENT.SORT_RECENT}
                </SelectItem>
                <SelectItem value={VideoSortOption.POPULAR}>
                  {VIDEO_FILTERS_CONTENT.SORT_POPULAR}
                </SelectItem>
                <SelectItem value={VideoSortOption.TRENDING}>
                  {VIDEO_FILTERS_CONTENT.SORT_TRENDING}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4 flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  VIDEO_FILTERS_CONTENT.DATE_RANGE
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateRangeChange(undefined)}
            >
              {VIDEO_FILTERS_CONTENT.CLEAR_DATES}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
