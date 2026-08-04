//import axios from 'axios';
import api from './api';
import type { Point } from '@/datatypes/index';
export interface Section {
  _id: string;
  name: string;
}



export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI/180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(2));
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

 export function convertDMS (dmsString: string) {
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


export async function generatePointName(latitude: number, longitude: number) {
  const nearestPoint = await findNearestPoint(latitude, longitude,)

  if (!nearestPoint) {
    console.log("Aucun point trouvé à proximité. Utilisation d'un nom générique.");
    return `UnknownSection-${formatDateDDMMYY()}`;
  }

  const sectionName = nearestPoint.section_id?.name ?? "UnknownSection"

  const timestamp = formatDateDDMMYY()

  return `${sectionName}-${timestamp}`
}

// Récupérer id de la section la plus proche d’un point donné
export async function findSectionId(latitude: number, longitude: number): Promise<string> {

  const nearestPoint = await findNearestPoint(latitude, longitude)

  if (!nearestPoint || !nearestPoint.section_id) {
    console.warn("Aucun point trouvé à proximité ou section manquante. Utilisation d'un nom générique.");
    return `UnknownSection-${formatDateDDMMYY()}`;
  }
  const sectionId = nearestPoint.section_id._id
  //console.log('Section la plus proche:', nearestPoint.section_id.name, 'ID:', sectionId);
  return sectionId
}

   


// Retrouver le point le plus proche d'un point incidental donné
export async function findNearestPoint(latitude: number, longitude: number): Promise<Point | null> {
  try {
    const res = await api.get('/points');
    const points: Point[] = res.data;
    let nearestPoint: Point | null = null;
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
    // console.log(` point le plus proche: ${nearestPoint.name} à ${minDistance} km`);
    return nearestPoint;
  } catch (error) {
    console.error("Erreur lors de la recherche du point le plus proche:", error);
    throw error;
  }
}





/*export async function findClosestPoints(latitude: number, longitude: number, data: Point[],  limit = 10) {
  try {
    const points = data;
    const pointsWithDistance = points.map((point: Point) => {
      if (point.latitude && point.longitude) {
        const distance = haversineDistance(latitude, longitude, point.latitude, point.longitude);
        return { ...point, distance };
      }
      return { ...point, distance: Infinity };
    });
    pointsWithDistance.sort((a: Point, b: Point) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    return pointsWithDistance.slice(0, limit);
  } catch (error) {
    console.error("Erreur lors de la recherche des points les plus proches:", error);
    throw error;
  }
}
}*/

export async function findClosestPoints(
  latitude: number,
  longitude: number,
  data: Point[],
  limit = 10
) {
  try {
    // ✅ Garde-fou — s'assure que data est bien un tableau
    const points = Array.isArray(data) ? data : [];

    if (points.length === 0) {
      console.warn("findClosestPoints: data est vide ou non valide", data);
      return [];
    }

    const pointsWithDistance = points
      .filter((point: Point) =>
        point.latitude != null &&
        point.longitude != null
      )
      .map((point: Point) => ({
        ...point,
        distance: haversineDistance(
          latitude,
          longitude,
          point.latitude,
          point.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const closest = pointsWithDistance.slice(0, limit);

    // ✅ Les deux .find() étaient identiques — corrigé
    const hasStation = closest.some((point) => point.nature === "gare");

    if (!hasStation) {
      // Cherche la gare la plus proche dans TOUS les points
      const station = pointsWithDistance.find(
        (point) => point.nature === "gare"
      );

      if (station) {
        // Remplace le dernier élément par la gare
        closest[closest.length - 1] = station;

        // Déduplique et retrie par distance
        const unique = new Map();
        closest.forEach((point) => unique.set(point._id, point));

        return Array.from(unique.values()).sort(
          (a, b) => a.distance - b.distance
        );
      }
    }

    return closest;
  } catch (error) {
    console.error("Erreur findClosestPoints:", error);
    throw error;
  }
}