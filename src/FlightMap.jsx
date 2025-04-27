
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';


const icon = L.icon({
  iconUrl: ('/flight-icon.png'),
  iconSize: [35, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
})

function FitBoundaries({ zsuBoundary, zwyBoundary, ttzpBoundary, svzmBoundary, tncfBoundary}) {
  const map = useMap();
  useEffect(() => {
    const coords = [
      ...(zsuBoundary?.geometry?.coordinates[0] || []),
      ...(zwyBoundary?.geometry?.coordinates[0] || []),
      ...(ttzpBoundary?.geometry?.coordinates[0] || []),
      ...(svzmBoundary?.geometry?.coordinates[0] || []),
      ...(tncfBoundary?.geometry?.coordinates[0] || [])
    ];
    const latLngBounds = coords.map(([lon, lat]) => [lat, lon]); // Flip order
    if (latLngBounds.length > 0) {
      map.fitBounds(latLngBounds);
    }
  }, [zsuBoundary, zwyBoundary, map]);
  return null;
}

function FlightMap({ flights }) {
  const [zsuBoundary, setZsuBoundary] = useState(null);
  const [zwyBoundary, setZwyBoundary] = useState(null);
  const [ttzpBoundary, setTtzpPBoundary] = useState(null);
  const [svzmBoundary, setSvzmBoundary] = useState(null);
  const [tncfBoundary, setTncfBoundary] = useState(null);

  useEffect(() => {
    fetch('/Boundaries.geojson')
      .then(res => res.json())
      .then(data => {
        const features = data.features || [];
        setZsuBoundary(features.find(f => f.properties?.id === 'TJZS'));
        setZwyBoundary(features.find(f => f.properties?.id === 'KZWY'));
        setTtzpPBoundary(features.find(f => f.properties?.id === 'TTZP'));
        setSvzmBoundary(features.find(f => f.properties?.id === 'SVZM'));
        setTncfBoundary(features.find(f => f.properties?.id === 'TNCF'));
      });
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer center={[18.5, -66]} zoom={6} className="leaflet-container">
        <TileLayer
          url="https://api.mapbox.com/styles/v1/yancarlos4500/clnorn0yn008v01qugoglakdj/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWFuY2FybG9zNDUwMCIsImEiOiJja2ZrbnQzdmExMDhnMzJwbTdlejNhdnJuIn0.aoHpGyZLaQRcp8SPYowuOQ"
          attribution="© OpenStreetMap"
        />
        {zsuBoundary && (
          <GeoJSON data={zsuBoundary} style={{ color: 'green', weight: 2, fillOpacity: 0.2 }} />
        )}
        {zwyBoundary && (
          <GeoJSON data={zwyBoundary} style={{  weight: 2, fillOpacity: 0 }} />
        )}
         {zwyBoundary && (
          <GeoJSON data={ttzpBoundary} style={{  weight: 2, fillOpacity: 0 }} />
        )}
         {zwyBoundary && (
          <GeoJSON data={svzmBoundary} style={{  weight: 2, fillOpacity: 0 }} />
        )}
         {zwyBoundary && (
          <GeoJSON data={tncfBoundary} style={{  weight: 2, fillOpacity: 0 }} />
        )}
        <FitBoundaries zsuBoundary={zsuBoundary} zwyBoundary={zwyBoundary} />
        {flights.filter(f => f.lat && f.lon).map((flight, idx) => (
          <Marker 
          key={idx} 
          position={[flight.lat, flight.lon]} 
          icon={icon}
          rotationAngle={flight.heading}
          rotationOrigin={'center center'}>
            <Popup>{flight.Callsign}</Popup>
          </Marker>
        ))}
      
{/* TTZP */}
<Marker
  position={[15, -64.146247]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">ANADA</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[15, -63.250000]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">GEECE</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[ 16.301111,-63]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">ILURI</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[ 16.958889,-63.000000]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">MODUX</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[ 17.353333,-63.000000]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">GABAR</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[17.473056,-62.833056]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">ZPATA</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[ 17.650056,-62.554389]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">ELOPO</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

<Marker
  position={[18, -61.966111]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">LAMKN</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>



{/* ZWY */}

<Marker
  position={[21.621478, -67.197817]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">KINCH</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[22.036886, -66.170619]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:10px;  position: relative; top: 0px; left:-15px;">HANCY</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[22.046697, -66.009619]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:10px;  position: relative; top: -45px; left:5px;">CHEDR</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[22.097069, -65.134825]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">KEEKA</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[21.856597, -63.846578]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">OPAUL</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[21.116403, -63.061878]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">SOCCO</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[20.538769, -62.457578]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">DAWIN</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>
<Marker
  position={[19.341283, -61.767164]}
  icon={L.divIcon({
    html: '<div style="color: cyan; font-size: 20px;">▲<div style="font-size:12px;  position: relative; top: -5px; left:-5px;">OBIKE</div></div>',
    className: '',
    iconSize: [30, 30]
  })}
/>

</MapContainer>
    </div>
  );
}

export default FlightMap;
