export async function onRequest(context: any): Promise<Response> {
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'session=; Path=/; Max-Age=0' } });
}
