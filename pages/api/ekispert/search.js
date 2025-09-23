
export default async function handler(req, res){
  const key = process.env.EKISPERT_API_KEY;
  if(!key) return res.status(400).json({ error: "Missing EKISPERT_API_KEY" });
  const { from, to, date, time } = req.query;
  const url = `https://api.ekispert.jp/v1/json/search/course/light?key=${key}&from=${encodeURIComponent(from||'東京')}&to=${encodeURIComponent(to||'新大阪')}` + (date?`&date=${encodeURIComponent(date)}`:'') + (time?`&time=${encodeURIComponent(time)}`:'');
  try { const r = await fetch(url); const data = await r.json(); res.status(200).json(data); }
  catch (e){ res.status(500).json({ error: e.message }); }
}
