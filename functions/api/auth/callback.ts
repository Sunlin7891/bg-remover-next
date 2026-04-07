export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (url.searchParams.get('error')) return new Response(null, { status: 302, headers: { Location: '/?error=auth_failed' } });
  if (!code) return new Response(null, { status: 302, headers: { Location: '/?error=no_code' } });
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${env.BASE_URL}/api/auth/callback`,
      }),
    });
    if (!tokenRes.ok) throw new Error('Token exchange failed');
    const tokens = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) throw new Error('Failed to get user info');
    const userInfo = await userRes.json();
    const sessionData = btoa(JSON.stringify({ id: userInfo.id, email: userInfo.email, name: userInfo.name, picture: userInfo.picture }));
    return new Response(null, {
      status: 302,
      headers: { Location: '/', 'Set-Cookie': `session=${sessionData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure` },
    });
  } catch (err) {
    console.error('OAuth error:', err);
    return new Response(null, { status: 302, headers: { Location: '/?error=auth_failed' } });
  }
}
