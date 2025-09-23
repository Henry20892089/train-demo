
export default async function handler(req, res){
  const { lat, lon } = req.query;
  if(!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;
  try { const r = await fetch(url); const data = await r.json(); res.status(200).json({ current: data.current }); }
  catch (e){ res.status(500).json({ error: e.message }); }
}
