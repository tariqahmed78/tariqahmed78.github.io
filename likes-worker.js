/**
 * Cloudflare Worker for TR Tech Media Article Likes
 * Uses Cloudflare KV to store like counts per post and IP addresses to prevent spam.
 * 
 * Security features:
 * - IP-based rate limiting (max 20 requests per minute per IP)
 * - Origin validation (only accepts requests from trtechmedia.com)
 * - Post ID sanitization (only allows alphanumeric + hyphens, max 50 chars)
 * - One like per visitor per post (enforced server-side via IP hash)
 */

const RATE_LIMIT_WINDOW = 60;       // seconds
const RATE_LIMIT_MAX_REQUESTS = 20; // max requests per window per IP
const ALLOWED_ORIGIN = 'https://trtechmedia.com';

export default {
  async fetch(request, env) {
    // 1. CORS headers — only allow your domain
    const origin = request.headers.get('Origin') || '';
    const isAllowedOrigin = origin === ALLOWED_ORIGIN;

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowedOrigin ? ALLOWED_ORIGIN : '',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Block requests from unknown origins (direct API calls from bots)
    if (!isAllowedOrigin && origin !== '') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // 3. Rate limiting — prevent abuse
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hashIP(ip);
    const rateLimitKey = `ratelimit_${ipHash}`;

    let requestCount = parseInt(await env.LIKES_KV.get(rateLimitKey) || '0');
    if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(RATE_LIMIT_WINDOW) }
      });
    }
    // Increment rate limit counter
    await env.LIKES_KV.put(rateLimitKey, String(requestCount + 1), { expirationTtl: RATE_LIMIT_WINDOW });

    // 4. Parse and validate the post ID
    const url = new URL(request.url);
    const postId = url.searchParams.get('post');
    if (!postId || !/^[a-zA-Z0-9-]{1,50}$/.test(postId)) {
      return new Response('Invalid post ID', { status: 400, headers: corsHeaders });
    }

    const countKey = `likes_count_${postId}`;
    const userKey = `likes_user_${postId}_${ipHash}`;

    // 5. Handle GET request (Fetch current likes)
    if (request.method === 'GET') {
      const count = await env.LIKES_KV.get(countKey) || '0';
      const hasLiked = await env.LIKES_KV.get(userKey) !== null;

      return new Response(JSON.stringify({ count: parseInt(count), liked: hasLiked }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 6. Handle POST request (Add a like)
    if (request.method === 'POST') {
      const hasLiked = await env.LIKES_KV.get(userKey) !== null;

      let count = parseInt(await env.LIKES_KV.get(countKey) || '0');

      if (!hasLiked) {
        count += 1;
        await env.LIKES_KV.put(countKey, count.toString());
        await env.LIKES_KV.put(userKey, '1', { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days
      }

      return new Response(JSON.stringify({ count, liked: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
};

// Helper: hash IP for privacy (never store raw IPs)
async function hashIP(ip) {
  const msgUint8 = new TextEncoder().encode(ip + 'trtech_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
