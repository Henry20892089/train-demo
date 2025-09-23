
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import qs from 'qs';
import QRCode from 'qrcode';
import { TOKAIDO, STOPS_TOKAIDO } from '../lib/routeShapes';
import { TokaidoStations } from '../lib/stations';
import { haversineKm } from '../lib/utils';

const LiveMap = dynamic(() => import('../components/LiveMap'), { ssr: false });

function mapTrainToLine(trainNo){
  return { line: 'Tokaido Shinkansen', path: TOKAIDO, stops: STOPS_TOKAIDO };
}

export default function Home(){
  const [dark, setDark] = useState(false);
  const [trainNo, setTrainNo] = useState('Nozomi 237');
  const [from, setFrom] = useState('Tokyo');
  const [to, setTo] = useState('Shin-Osaka');
  const lineInfo = useMemo(()=> mapTrainToLine(trainNo), [trainNo]);

  const [center, setCenter] = useState(lineInfo.path[0]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('On time');
  const [speed, setSpeed] = useState(0);
  const [wx, setWx] = useState(null);
  const [elev, setElev] = useState(null);
  const [qr, setQr] = useState(null);
  const prevRef = useRef({ pos: null, ts: null });

  useEffect(()=>{ document.documentElement.classList.toggle('dark', dark); }, [dark]);

  // ticker (simulated movement + stats)
  useEffect(()=>{
    const t = setInterval(async ()=>{
      const i2 = (idx + 1) % lineInfo.path.length;
      const next = lineInfo.path[i2];
      const ts = Date.now();
      if(prevRef.current.pos && prevRef.current.ts){
        const km = haversineKm(prevRef.current.pos, next);
        const dtH = (ts - prevRef.current.ts)/3600000;
        const v = dtH>0 ? (km/dtH) : 0;
        setSpeed(Math.round(v));
      }
      prevRef.current = { pos: next, ts };
      setIdx(i2);
      setCenter(next);
      const d = Math.round(Math.sin(Date.now()/300000)*3);
      setStatus(d>0?`${d} min late`:d<0?`${Math.abs(d)} min early`:'On time');
      try { const r = await fetch(`/api/geo/weather?lat=${next[0]}&lon=${next[1]}`); const x = await r.json(); setWx(x.current||null);}catch{}
      try { const r = await fetch(`/api/geo/elevation?lat=${next[0]}&lon=${next[1]}`); const x = await r.json(); setElev(x.elevation??null);}catch{}
    }, 3500);
    return ()=> clearInterval(t);
  }, [lineInfo, idx]);

  const shareUrl = (typeof location!=='undefined'?location.href:'https://ezshin.com');
  useEffect(()=>{
    QRCode.toDataURL(shareUrl, { margin: 1, width: 160 }).then(setQr).catch(()=>setQr(null));
  }, [shareUrl]);

  function shareNative(){
    if(navigator.share){
      navigator.share({ title: 'EZShin', text: 'Track my Shinkansen', url: shareUrl }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard');
    }
  }

  return (
    <div>
      <header className="header">
        <div className="container row">
          <div className="row" style={{gap:8}}>
            <span style={{fontWeight:700}}>🚄 EZShin</span>
            <span className="badge">Deluxe</span>
          </div>
          <label className="toggle small">
            <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} /> Dark
          </label>
        </div>
      </header>

      <main className="container" style={{display:'grid', gap:16}}>
        <section className="card">
          <h2 className="title">Track Your Shinkansen</h2>
          <p className="sub">Share links, QR codes, weather/elevation.</p>
          <div className="grid3">
            <div>
              <label className="small">Train Number</label>
              <input className="input" value={trainNo} onChange={e=>setTrainNo(e.target.value)} placeholder="e.g., Nozomi 237" />
            </div>
            <div>
              <label className="small">From</label>
              <input list="stops" className="input" value={from} onChange={e=>setFrom(e.target.value)} placeholder="Tokyo" />
            </div>
            <div>
              <label className="small">To</label>
              <input list="stops" className="input" value={to} onChange={e=>setTo(e.target.value)} placeholder="Shin-Osaka" />
            </div>
          </div>
          <datalist id="stops">
            {TokaidoStations.map(s => <option key={s} value={s} />)}
          </datalist>

          <div className="sharebar" style={{marginTop:12}}>
            <button className="button" onClick={shareNative}>Share</button>
          </div>

          <div className="qr" style={{marginTop:12}}>
            {qr ? <img src={qr} width="160" height="160" alt="QR code" /> : <span className="small">Generating QR…</span>}
          </div>
        </section>

        <section className="card">
          <h3 className="title">Map</h3>
          <LiveMap path={TOKAIDO} center={center} />
        </section>

        <section className="card">
          <h3 className="title">Live Stats</h3>
          <div className="grid3">
            <div className="stat"><div className="v">{speed} km/h</div><div className="k">Speed (computed)</div></div>
            <div className="stat"><div className="v">{status}</div><div className="k">Status</div></div>
            <div className="stat"><div className="v">{wx?.temperature_2m??'—'}°C</div><div className="k">Outside Temp</div></div>
            <div className="stat"><div className="v">{wx?.wind_speed_10m??'—'} m/s</div><div className="k">Wind Speed</div></div>
            <div className="stat"><div className="v">{elev??'—'} m</div><div className="k">Elevation</div></div>
            <div className="stat"><div className="v">{center[0]?.toFixed(3)}, {center[1]?.toFixed(3)}</div><div className="k">Lat, Lon</div></div>
          </div>
        </section>
      </main>

      <div className="footer">EZShin.com — Deluxe build.</div>
    </div>
  );
}
