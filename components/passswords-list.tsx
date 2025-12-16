"use client";

import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Password } from "@/data/tenant-schema";

import PasswordCard from "./password-card";
import { Search } from "./search";

interface PasswordsListProps {
  passwords: Password[];
  categories?: Array<{ id: number; name: string; color: string | null }>;
}

export default function PasswordsList({ passwords, categories = [] }: PasswordsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "modified">("name");

  const filteredAndSorted = useMemo(() => {
    let filtered = passwords;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryId = parseInt(selectedCategory);
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "modified":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [passwords, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="py-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <Search onSearch={setSearchQuery} />
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="category-filter" className="whitespace-nowrap">
            Category:
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-[150px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="sort-by" className="whitespace-nowrap">
            Sort by:
          </Label>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger id="sort-by" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date added</SelectItem>
              <SelectItem value="modified">Recently modified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery || selectedCategory !== "all"
            ? "No passwords match your filters"
            : "No passwords found"}
        </div>
      ) : (
        <div className="border rounded-lg">
          {filteredAndSorted.map((password) => (
            <PasswordCard {...password} key={password.id} />
          ))}
        </div>
      )}
    </div>
  );
}
