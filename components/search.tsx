"use client";

import { Search as SearchIcon } from "lucide-react";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/use-debounce";

interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function Search({ onSearch, placeholder = "Search passwords..." }: SearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="md:w-[100px] lg:w-[300px] pl-9"
      />
    </div>
  );
}
