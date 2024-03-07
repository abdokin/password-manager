"use server"
import { parse } from 'node-html-parser';

async function getFaviconUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML using node-html-parser
    const root = parse(html);

    // Extract favicon link
    const faviconElement = root.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    const faviconUrl = faviconElement ? faviconElement.getAttribute('href') : null;

    if (faviconUrl) {
      // If the URL is relative, construct the absolute URL
      return new URL(faviconUrl, url).toString();
    }

    // Fallback to the default location
    return new URL('/favicon.ico', url).toString();
  } catch (error) {
    console.error('Error fetching favicon:', (error as Error).message);
    return null;
  }
}

export default getFaviconUrl;
