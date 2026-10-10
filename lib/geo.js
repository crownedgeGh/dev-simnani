const GEO_ERROR_MESSAGES = {
  1: "Location is blocked for this site. Click the location icon at the left of your browser's address bar, choose \"Allow\", then click this button again.",
  2: "Your device couldn't determine your location. Check that location is turned on in your OS settings.",
  3: "Location request timed out. Please try again.",
};

export function getCurrentCoords({ timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location isn't supported on this browser."));
      return;
    }
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      reject(new Error("Location requires a secure (https) connection."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(GEO_ERROR_MESSAGES[err.code] || "Couldn't get your location. Please allow location access and try again.")),
      { enableHighAccuracy: false, timeout, maximumAge: 60000 }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const data = await res.json();
  return {
    city: data?.city || data?.locality || "",
    locality: data?.locality || "",
    state: data?.principalSubdivision || "",
  };
}

// Matches a reverse-geocoded name against a known options list (case-insensitive) —
// dropdowns only accept values from their fixed list, so a raw API string can't be set directly.
export function matchFromOptions(value, options) {
  if (!value) return "";
  return options.find((o) => o.toLowerCase() === value.toLowerCase()) || "";
}
