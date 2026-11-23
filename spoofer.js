(() => {
  const TARGET = { lat: 46.6542024, lng: 20.2659770 };
  const RADIUS_M = 300;

  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dist = (a, b) => {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
              Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };

  const mkPos = (lat, lng, acc = 8) => ({
    coords: {
      latitude: lat, longitude: lng, accuracy: acc,
      altitude: null, altitudeAccuracy: null,
      heading: null, speed: null
    },
    timestamp: Date.now()
  });

  const jitter = () => (Math.random() - 0.5) * 1e-5;

  const fake = {
    getCurrentPosition: (ok) =>
      setTimeout(() => ok(mkPos(TARGET.lat + jitter(), TARGET.lng + jitter())), 120),
    watchPosition: (ok) => {
      const id = setInterval(
        () => ok(mkPos(TARGET.lat + jitter(), TARGET.lng + jitter())),
        1000
      );
      return id;
    },
    clearWatch: (id) => clearInterval(id)
  };

  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    get: () => fake
  });

  if (navigator.permissions?.query) {
    const origQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (desc) =>
      desc?.name === 'geolocation'
        ? Promise.resolve({ state: 'granted', onchange: null })
        : origQuery(desc);
  }

  console.log(
    '%c[Z] geolocation spoofed -> target',
    'color:#0f0;font-weight:bold',
    TARGET
  );
  console.log(
    '[Z] real distance to target (if you share coords):',
    'call window.__zDist(lat,lng)'
  );

  window.__zDist = (lat, lng) => {
    const d = dist({ lat, lng }, TARGET);
    console.log(`[Z] distance = ${d.toFixed(1)} m (radius ${RADIUS_M} m) — ${d <= RADIUS_M ? 'PASS' : 'FAIL'}`);
    return d;
  };
})();