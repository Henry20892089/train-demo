
'use client';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function FlyTo({ center }){
  const map = useMap();
  useEffect(()=>{ if(center) map.flyTo(center, 8, { duration: 0.8 }); }, [center]);
  return null;
}

export default function LiveMap({ path, center }){
  return (
    <MapContainer center={center} zoom={7} className="map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyTo center={center} />
      {path?.length ? <Polyline positions={path} /> : null}
      {center ? <Marker position={center} /> : null}
    </MapContainer>
  );
}
