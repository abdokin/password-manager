import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// // Example usage
// const websiteUrl = 'https://www.example.com';
// getFaviconUrl(websiteUrl).then((faviconUrl) => {
//   if (faviconUrl) {
//     console.log('Favicon URL:', faviconUrl);
//   } else {
//     console.log('Favicon not found.');
//   }
// });
