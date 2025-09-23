
export function haversineKm(a, b){
  const R = 6371, toRad = x=>x*Math.PI/180;
  const dLat = toRad(b[0]-a[0]), dLon = toRad(b[1]-a[1]);
  const s1 = Math.sin(dLat/2), s2 = Math.sin(dLon/2);
  const c = 2 * Math.asin(Math.sqrt(s1*s1 + Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*s2*s2));
  return R * c;
}
export function totalLength(path){
  let sum = 0;
  for(let i=0;i<path.length-1;i++) sum += haversineKm(path[i], path[i+1]);
  return sum;
}
