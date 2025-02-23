import { Search } from "lucide-react";
import { cn } from "~/lib/utils";
import { Label } from "../ui/label";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "../ui/sidebar";
import { useState } from "react";

interface SearchFormProps {
  placeholder?: string;
  className?: string;
  onSubmit?: (value: string) => void;
  defaultValue?: string;
}

export function SearchForm({
  placeholder = "Search the docs...",
  className,
  onSubmit,
  defaultValue = "",
  ...props
}: SearchFormProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={cn("pl-8", className)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
