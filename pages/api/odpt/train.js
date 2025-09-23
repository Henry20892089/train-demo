
export default async function handler(req, res){
  const key = process.env.ODPT_API_KEY;
  if(!key) return res.status(400).json({ error: "Missing ODPT_API_KEY" });
  const { railway, trainNo } = req.query;
  try {
    const url = `https://api-tokyochallenge.odpt.org/api/v4/odpt:Train?odpt:railway=${encodeURIComponent(railway)}&acl:consumerKey=${key}`;
    const r = await fetch(url);
    const arr = await r.json();
    const match = arr.find(t => (t['odpt:trainNumber']||'').toString().includes(trainNo||'')) || null;
    res.status(200).json({ rawCount: arr.length, match });
  } catch (e){ res.status(500).json({ error: e.message }); }
}
