import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 35.682839,
  lng: 139.759455
};

function Map() {
  return (
    <>
      <div className="w-9/12 h-full">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
          </GoogleMap>
        </LoadScript>
      </div>
    </>
  );
}

export default Map;
