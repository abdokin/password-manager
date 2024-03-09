"use server"
async function getFaviconUrl(url: string): Promise<string | null> {
  try {
    const apiUrl =
      "https://besticon-demo.herokuapp.com/allicons.json?url=" + url;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch favicon. Status: ${response.status}`);
    }

    const res = await response.json();

    const icons = res.icons ?? [];

    if (icons.length > 0 && icons[0].url) {
      return icons[0].url;
    } else {
      console.warn("No favicon found for the given URL. Returning default favicon.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching favicon:", (error as Error).message);
    return null;
  }
}

export default getFaviconUrl;
