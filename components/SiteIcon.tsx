import getFaviconUrl from "@/lib/get-favicon";
import { GlobeIcon } from "@radix-ui/react-icons";


export default async function SiteIcon({url}:{url: string}) {
  const favicon = await getFaviconUrl(url);
  return (
    <div className="flex items-center gap-1">
      {favicon ? (
        <img src={favicon} className="h-8 w-8" />
      ) : (
        <GlobeIcon className="h-8 w-8" />
      )}
      <p>{url}</p>
    </div>
  );
}
