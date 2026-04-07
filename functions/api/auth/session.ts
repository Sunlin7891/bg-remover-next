export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const cookies = request.headers.get('cookie') || '';
  const sessionCookie = cookies.split(';').find((c: string) => c.trim().startsWith('session='));
  if (!sessionCookie) return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } });
  try {
    const data = sessionCookie.split('=')[1];
    const user = JSON.parse(atob(data));
    return new Response(JSON.stringify(user), { headers: { 'Content-Type': 'application/json' } });
  } catch { return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } }); }
}
