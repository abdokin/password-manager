import { GlobeIcon } from "@radix-ui/react-icons";

import Image from "next/image";

import getFaviconUrl from "@/lib/get-favicon";

export default async function SiteIcon({ url }: { url: string }) {
  const favicon = await getFaviconUrl(url);
  return (
    <div className="flex items-center gap-1">
      {favicon ? (
        <Image alt="" src={favicon} width={32} height={32} className="h-8 w-8" unoptimized />
      ) : (
        <GlobeIcon className="h-8 w-8" />
      )}
      <p>{url}</p>
    </div>
  );
}
