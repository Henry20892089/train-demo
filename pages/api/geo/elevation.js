
export default async function handler(req, res){
  const { lat, lon } = req.query;
  if(!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });
  const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
  try { const r = await fetch(url); const data = await r.json(); const elevation = data?.results?.[0]?.elevation ?? null; res.status(200).json({ elevation }); }
  catch (e){ res.status(500).json({ error: e.message }); }
}
