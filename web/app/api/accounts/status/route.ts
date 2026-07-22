import { oauthConfigured as xOauthConfigured } from "@/lib/xOauth";
import { igOauthConfigured } from "@/lib/igOauth";

/** Public status of which OAuth apps are configured (no secrets). */
export async function GET(): Promise<Response> {
  return Response.json({
    x_oauth: xOauthConfigured(),
    instagram_oauth: igOauthConfigured(),
    apify: Boolean(process.env.APIFY_API_TOKEN),
    x_ads: Boolean(process.env.X_ADS_ACCESS_TOKEN && process.env.X_ADS_ACCOUNT_ID),
  });
}
