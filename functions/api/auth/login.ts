export async function onRequest(context: any): Promise<Response> {
  const { env } = context;
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.BASE_URL}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600; Secure`,
    },
  });
}
