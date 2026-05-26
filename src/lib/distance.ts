import axios from 'axios';
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => d * Math.PI/180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(2);
}

// src/lib/geo/convertDMSToDecimal.ts

export type DMSInput = string | number

export function convertDMSToDecimal(dms: DMSInput): number | null {
  // cas simple : déjà un nombre
  if (typeof dms === "number") {
    return Number.isFinite(dms) ? dms : null
  }

  // cas string numérique (ex: "12.34")
  const numeric = Number(dms)
  if (!Number.isNaN(numeric) && dms.trim() !== "") {
    return numeric
  }

  const str = dms.trim()
  if (!str) return null

  const regex =
    /([NSEW])?[:\s-]*?(\d{1,3})[°:\s]*(\d{1,2})?[′':\s]*(\d{1,2}(?:\.\d+)?)?[″"]?\s*([NSEW])?/i

  const match = str.match(regex)
  if (!match) return null

  const [, dir1, deg, min, sec, dir2] = match

  const direction = (dir1 ?? dir2)?.toUpperCase()

  const degrees = parseInt(deg, 10)
  const minutes = min ? parseInt(min, 10) : 0
  const seconds = sec ? parseFloat(sec) : 0

  if (
    Number.isNaN(degrees) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return null
  }

  let decimal = degrees + minutes / 60 + seconds / 3600

  if (direction === "S" || direction === "W") {
    decimal = -decimal
  }

  return decimal
}

 export function convertDMS (dmsString) {
  if (!dmsString) return null;
  // Expression régulière améliorée pour gérer les secondes décimales
  const regex = /([NSWE]):\s*(\d{1,3})[°:\s]*(\d{1,2})[′':\s]*(\d{1,2}(?:\.\d+)?)[″"]?/gi;
  const matches = [...dmsString.matchAll(regex)];
  let lat = null, lng = null;

  for (const match of matches) {
    const [, dir, deg, min, sec] = match;
    const decimal = parseInt(deg) + parseInt(min) / 60 + parseFloat(sec) / 3600;
    if (dir === 'S') lat = -decimal;
    else if (dir === 'N') lat = decimal;
    else if (dir === 'W') lng = -decimal;
    else if (dir === 'E') lng = decimal;
  }

  return { lat, lng };
};


export function generateId(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDateDDMMYY(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}


export async function generatePointName(latitude, longitude, header) {
  const nearestPoint = await findNearestPoint(latitude, longitude, header)

  if (!nearestPoint) {
    console.warn("Aucun point trouvé à proximité. Utilisation d'un nom générique.");
    return `UnknownSection-${formatDateDDMMYY()}`;
  }

  const sectionName = nearestPoint.section_id.name

  const timestamp = formatDateDDMMYY()

  return `${sectionName}-${timestamp}`
}

// Récupérer id de la section la plus proche d’un point donné
export async function findSectionId(latitude, longitude, header) {

  const nearestPoint = await findNearestPoint(latitude, longitude, header)

  if (!nearestPoint) {
    console.warn("Aucun point trouvé à proximité. Utilisation d'un nom générique.");
    return `UnknownSection-${formatDateDDMMYY()}`;
  }
const sectionId = nearestPoint.section_id._id
console.log('Section la plus proche:', nearestPoint.section_id.name, 'ID:', sectionId);
  return sectionId
}

   


// Retrouver le point le plus proche d'un point incidental donné
export async function findNearestPoint(latitude, longitude, header) {
  try {
    const res = await axios.get('/api/points', { headers: header });
    const points = res.data;
    let nearestPoint = null;
    let minDistance = Infinity; 
    points.forEach(point => {
      if (point.latitude && point.longitude) {
        const distance = haversineDistance(latitude, longitude, point.latitude, point.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = point;
        }
      }
    });
    console.log(` point le plus proche: ${nearestPoint.name} à ${minDistance} km`);
    return nearestPoint;
  } catch (error) {
    console.error("Erreur lors de la recherche du point le plus proche:", error);
    throw error;
  }
}

// les dix points les plus proches d’un point incident donné avec leur distance respective
export async function findClosestPoints(latitude, longitude, header, limit = 10) {
  try {
    const res = await axios.get('/api/points', { headers: header });
    const points = res.data;
    const pointsWithDistance = points.map(point => {
      if (point.latitude && point.longitude) {
        const distance = haversineDistance(latitude, longitude, point.latitude, point.longitude);
        console.log(`Distance entre (${latitude}, ${longitude}) et ${point.name} (${point.latitude}, ${point.longitude}): ${distance} km`);
        return { ...point, distance };
      }
      return { ...point, distance: Infinity };
    });
    pointsWithDistance.sort((a, b) => a.distance - b.distance);
    return pointsWithDistance.slice(0, limit);
  } catch (error) {
    console.error("Erreur lors de la recherche des points les plus proches:", error);
    throw error;
  }
}