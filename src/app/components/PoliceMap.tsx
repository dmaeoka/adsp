// / src/components/Map.tsx
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function PoliceMap(props: any) {
	// const { position, zoom } = props;
	const position: LatLngTuple = [51.505, -0.09];

	return (
		<MapContainer
			center={position}
			zoom={14}
			scrollWheelZoom={false}
			style={{ height: "100vh", width: "100%" }}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'
			/>
			<Marker position={position}>
				<Popup>
					A pretty CSS3 popup. <br /> Easily customizable.
				</Popup>
			</Marker>
		</MapContainer>
	);
}
