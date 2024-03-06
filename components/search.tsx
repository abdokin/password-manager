import { Input } from "@/components/ui/input";

export function Search() {
  return (
    <div>
      <Input
        type="search"
        placeholder="Search passwords..."
        className="md:w-[100px] lg:w-[300px]"
      />
    </div>
  );
}
