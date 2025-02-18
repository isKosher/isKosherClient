import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { AspectRatio } from "./ui/aspect-ratio";

export default function Map(props: any) {
  const { position, zoom } = props;

  return (
    <AspectRatio ratio={1}>
      <MapContainer
        center={position}
        zoom={props.zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}></Marker>
      </MapContainer>
    </AspectRatio>
  );
}
