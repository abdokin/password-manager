"use client";

import { Plus, X } from "lucide-react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/data/tenant-schema";
import { createCategory, getUserCategories } from "@/lib/tenant-categories";

const CATEGORY_COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
];

interface CategorySelectorProps {
  value?: number | null;
  onValueChange: (value: number | null) => void;
  categories: Category[];
  onCategoryCreated?: () => void;
}

export function CategorySelector({
  value,
  onValueChange,
  categories,
  onCategoryCreated,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0].value);
  const { toast } = useToast();

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Category name is required",
      });
      return;
    }

    const result = await createCategory({
      name: categoryName.trim(),
      color: categoryColor,
    });

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: "Category created",
        description: "Category has been created successfully",
      });
      setCategoryName("");
      setOpen(false);
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <div className="flex gap-2">
        <Select
          value={value?.toString() || "none"}
          onValueChange={(v) => onValueChange(v === "none" ? null : parseInt(v))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                <div className="flex items-center gap-2">
                  {cat.color && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  )}
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Work, Personal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">Color</Label>
                <Select value={categoryColor} onValueChange={setCategoryColor}>
                  <SelectTrigger id="category-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {selectedCategory && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Selected:</span>
          {selectedCategory.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span>{selectedCategory.name}</span>
        </div>
      )}
    </div>
  );
}
