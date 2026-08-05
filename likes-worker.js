/**
 * Cloudflare Worker for TR Tech Media Article Likes
 * Uses Cloudflare KV to store like counts per post and IP addresses to prevent spam.
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS so the website can talk to this worker
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://trtechmedia.com', // change to '*' for local testing if needed
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Parse the request
    const url = new URL(request.url);
    const postId = url.searchParams.get('post');
    if (!postId) {
      return new Response('Missing post ID', { status: 400, headers: corsHeaders });
    }

    // Hash the user's IP to anonymously identify them
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hashIP(ip);
    
    const countKey = `likes_count_${postId}`;
    const userKey = `likes_user_${postId}_${ipHash}`;

    // 3. Handle GET request (Fetch current likes)
    if (request.method === 'GET') {
      const count = await env.LIKES_KV.get(countKey) || "0";
      const hasLiked = await env.LIKES_KV.get(userKey) !== null;
      
      return new Response(JSON.stringify({ count: parseInt(count), liked: hasLiked }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Handle POST request (Add a like)
    if (request.method === 'POST') {
      const hasLiked = await env.LIKES_KV.get(userKey) !== null;
      
      let count = parseInt(await env.LIKES_KV.get(countKey) || "0");

      if (!hasLiked) {
        count += 1;
        await env.LIKES_KV.put(countKey, count.toString());
        await env.LIKES_KV.put(userKey, '1', { expirationTtl: 60 * 60 * 24 * 30 }); // Store IP hash for 30 days
      }

      return new Response(JSON.stringify({ count, liked: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
};

// Helper function to hash IP so we don't store actual IP addresses (privacy)
async function hashIP(ip) {
  const msgUint8 = new TextEncoder().encode(ip + "trtech_salt_2026");
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
