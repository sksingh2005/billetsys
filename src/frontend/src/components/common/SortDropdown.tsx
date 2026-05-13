/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface SortOption {
  key: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  currentSort: string | null;
  currentDir: "asc" | "desc";
  onSort: (column: string) => void;
}

export default function SortDropdown({
  options,
  currentSort,
  currentDir,
  onSort,
}: SortDropdownProps) {
  if (options.length === 0) {
    return null;
  }

  const directionLabel = currentDir === "asc" ? "↑" : "↓";
  const currentOption = options.find((o) => o.key === currentSort);
  const displayValue = currentOption
    ? `${currentOption.label} ${directionLabel}`
    : "Sort by…";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Sort by:
      </span>
      <Select
        value={currentSort || undefined}
        onValueChange={(value) => onSort(value)}
      >
        <SelectTrigger className="h-8 w-[160px]" id="sort-dropdown">
          <SelectValue placeholder="Sort by…">{displayValue}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label} {currentSort === option.key ? directionLabel : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
