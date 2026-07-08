import React, { useRef, useEffect, useMemo } from 'react';

/**
 * Interactive map (web) — a Leaflet map in an iframe. Tap or drag the pin to
 * choose an exact spot; the coordinate is reported back via `onPick`. Search-
 * driven centre changes come in through the `lat`/`lon` props and recentre the
 * map without reloading it.
 */
const PAGE = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#m{height:100%;margin:0}#m{border-radius:14px}</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('m',{zoomControl:true,attributionControl:false}).setView([__LAT__,__LON__],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  var marker = L.marker([__LAT__,__LON__],{draggable:true}).addTo(map);
  function send(){var ll=marker.getLatLng();parent.postMessage({__everlyMap:1,lat:ll.lat,lon:ll.lng},'*');}
  marker.on('dragend',send);
  map.on('click',function(e){marker.setLatLng(e.latlng);map.panTo(e.latlng);send();});
  window.addEventListener('message',function(ev){var d=ev.data;if(d&&d.__everlySet){map.setView([d.lat,d.lon],15);marker.setLatLng([d.lat,d.lon]);}});
  setTimeout(function(){map.invalidateSize();},250);
</script></body></html>`;

export default function MapPicker({ lat, lon, height = 220, onPick }: { lat: number; lon: number; height?: number; onPick: (lat: number, lon: number) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  // Build the page once (initial centre); later centre changes go via postMessage.
  const srcDoc = useMemo(() => PAGE.replace(/__LAT__/g, String(lat)).replace(/__LON__/g, String(lon)), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { __everlyMap?: number; lat?: number; lon?: number };
      if (d && d.__everlyMap && typeof d.lat === 'number' && typeof d.lon === 'number') onPickRef.current(d.lat, d.lon);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Recentre when the caller changes lat/lon (e.g. picked a search result).
  useEffect(() => {
    const w = ref.current?.contentWindow;
    if (w) w.postMessage({ __everlySet: 1, lat, lon }, '*');
  }, [lat, lon]);

  return React.createElement('iframe', {
    ref,
    srcDoc,
    style: { width: '100%', height, border: '0', borderRadius: 14, display: 'block' },
    title: 'Pick a location',
  });
}
