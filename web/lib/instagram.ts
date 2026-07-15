const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const GRAPH_API = "https://graph.facebook.com/v21.0";

export function instagramConfigured(): boolean {
  return Boolean(ACCESS_TOKEN);
}

export interface IgCreatorProfile {
  handle: string;
  name: string;
  followers: number;
  bio: string;
  business_email?: string;
  engagement_rate: number;
}

export async function searchCreatorsByHashtag(
  hashtag: string,
  minFollowers: number,
): Promise<IgCreatorProfile[]> {
  if (!ACCESS_TOKEN) throw new Error("Instagram not configured");

  const hashRes = await fetch(
    `${GRAPH_API}/ig_hashtag_search?q=${encodeURIComponent(hashtag)}&user_id=me&access_token=${ACCESS_TOKEN}`,
  );
  const hashJson = await hashRes.json();
  const hashtagId = hashJson.data?.[0]?.id;
  if (!hashtagId) return [];

  const mediaRes = await fetch(
    `${GRAPH_API}/${hashtagId}/recent_media?fields=id,caption,permalink,timestamp&user_id=me&access_token=${ACCESS_TOKEN}&limit=50`,
  );
  const mediaJson = await mediaRes.json();
  const media = mediaJson.data ?? [];

  // ponytail: IG Graph API doesn't expose other users' profiles from hashtag media.
  // Real path: Apify Instagram scraper or manual profile lookups.
  return media.map((m: { id: string; caption?: string; permalink?: string }) => ({
    handle: m.permalink?.split("/")[3] ?? m.id,
    name: "",
    followers: 0,
    bio: m.caption?.slice(0, 200) ?? "",
    engagement_rate: 0,
  }));
}

export function extractBusinessEmail(bio: string): string | undefined {
  const match = bio.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match?.[0];
}
