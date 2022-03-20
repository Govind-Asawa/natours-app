export function displayLoc(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ2FzYXdhIiwiYSI6ImNsMHdobWVtZjB2ZXAzY2tibXV5d2lkZWEifQ.wJOg6VBDgFZI8fGWRFWisg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gasawa/cl0xr6o6r000614qj0gfsiob1',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
}
