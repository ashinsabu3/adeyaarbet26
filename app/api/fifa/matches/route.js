const FIFA_URL = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=200';

export async function GET() {
  const res = await fetch(FIFA_URL, { next: { revalidate: 300 } });
  if (!res.ok) return Response.json([], { status: res.status });
  const data = await res.json();
  return Response.json(data.Results ?? []);
}
