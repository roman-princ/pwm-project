import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({
  path: path.join(projectRoot, ".env.local"),
  override: true,
});

const requiredKeys = [
  "FIREBASE_API_KEY",
  "FIREBASE_PROJECT_ID",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
];

const missing = requiredKeys.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

const apiKey = process.env.FIREBASE_API_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;
const adminEmail = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

const firestoreBase =
  `https://firestore.googleapis.com/v1/projects/${projectId}` +
  `/databases/(default)/documents`;

const toFirestoreFields = (obj) => {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
};

const toFirestoreValue = (value) => {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number" && Number.isInteger(value)) {
    return { integerValue: String(value) };
  }
  if (typeof value === "number") return { doubleValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  throw new Error(`Unsupported field type for value: ${value}`);
};

const fromFirestoreValue = (cell) => {
  if ("nullValue" in cell) return null;
  if ("stringValue" in cell) return cell.stringValue;
  if ("integerValue" in cell) return Number(cell.integerValue);
  if ("doubleValue" in cell) return cell.doubleValue;
  if ("booleanValue" in cell) return cell.booleanValue;
  return undefined;
};

const signIn = async () => {
  const url =
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword` +
    `?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      returnSecureToken: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Sign-in failed (${response.status}): ${errorBody}`);
  }

  const body = await response.json();
  return { idToken: body.idToken, uid: body.localId };
};

const getDocument = async (idToken, docPath) => {
  const response = await fetch(`${firestoreBase}/${docPath}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GET ${docPath} failed (${response.status}): ${errorBody}`,
    );
  }
  const body = await response.json();
  return body.fields ?? {};
};

const setDocument = async (idToken, docPath, data) => {
  const response = await fetch(`${firestoreBase}/${docPath}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PATCH ${docPath} failed (${response.status}): ${errorBody}`,
    );
  }
};

const buildSvgDataUrl = (label, gradient) => {
  const [colorA, colorB] = gradient;
  const escapedLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <text x="400" y="225" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${escapedLabel}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const palette = {
  social: ["#FF6B6B", "#FFB347"],
  cultural: ["#845EC2", "#D65DB1"],
  language: ["#0081CF", "#0089BA"],
  academic: ["#2C73D2", "#008F7A"],
  sports: ["#00C9A7", "#4D8076"],
  trips: ["#FF9671", "#F9F871"],
};

const mockEvents = [
  {
    id: 101,
    title: "International Tapas Night",
    category: "social",
    description:
      "Bring a dish from your country and meet Erasmus students from across Europe. Drinks and music provided by ESN ULPGC.",
    date: "2026-05-08",
    time: "20:00",
    location: "Plaza de Santa Ana, Las Palmas",
    organizer: "ESN ULPGC",
    registrationUrl: "https://example.com/events/tapas-night",
  },
  {
    id: 102,
    title: "Flamenco Workshop for Beginners",
    category: "cultural",
    description:
      "Discover the rhythm and passion of flamenco. Two hours of guided instruction with a professional dancer, no prior experience required.",
    date: "2026-05-12",
    time: "18:30",
    location: "Casa de Colón, Las Palmas",
    organizer: "Cultural Committee",
    registrationUrl: "https://example.com/events/flamenco",
  },
  {
    id: 103,
    title: "Spanish Conversation Exchange",
    category: "language",
    description:
      "Practice Spanish in a relaxed café setting. Native speakers and learners pair up for guided conversations on weekly themes.",
    date: "2026-05-15",
    time: "17:00",
    location: "Café Gourmet, Triana",
    organizer: "Language Buddies ULPGC",
    registrationUrl: "https://example.com/events/conversation",
  },
  {
    id: 104,
    title: "Erasmus Career Fair 2026",
    category: "academic",
    description:
      "Meet recruiters from across the Canary Islands and beyond. CV reviews, mock interviews, and panels on launching an international career.",
    date: "2026-05-20",
    time: "10:00",
    location: "ULPGC Campus de Tafira",
    organizer: "ULPGC Career Services",
    registrationUrl: "https://example.com/events/career-fair",
  },
  {
    id: 105,
    title: "Beach Volleyball Tournament",
    category: "sports",
    description:
      "Form a team of 4 and compete on the sands of Las Canteras. Prizes for the winning team and free smoothies for everyone.",
    date: "2026-05-23",
    time: "11:00",
    location: "Playa de Las Canteras",
    organizer: "ESN Sports",
    registrationUrl: "https://example.com/events/volleyball",
  },
  {
    id: 106,
    title: "Weekend Trip to Maspalomas Dunes",
    category: "trips",
    description:
      "Bus, guide, and packed lunch included. Hike the dunes at sunrise and end the day with a swim at Playa del Inglés.",
    date: "2026-05-30",
    time: "07:30",
    location: "Departure from ULPGC Main Gate",
    organizer: "Erasmus Travel Club",
    registrationUrl: "https://example.com/events/maspalomas",
  },
  {
    id: 107,
    title: "Karaoke & Game Night",
    category: "social",
    description:
      "Sing your heart out, play board games, and meet new friends. Snacks and the first drink are on the house.",
    date: "2026-06-05",
    time: "21:00",
    location: "Sala Babylon, Las Palmas",
    organizer: "ESN ULPGC",
    registrationUrl: "https://example.com/events/karaoke",
  },
  {
    id: 108,
    title: "Las Palmas Historic City Tour",
    category: "cultural",
    description:
      "A two-hour guided walk through Vegueta, the colonial heart of Las Palmas. Includes Casa de Colón and the Cathedral of Santa Ana.",
    date: "2026-06-10",
    time: "16:00",
    location: "Plaza del Pilar Nuevo, Vegueta",
    organizer: "Cultural Committee",
    registrationUrl: "https://example.com/events/city-tour",
  },
];

console.log(`Signing in as ${adminEmail} ...`);
const { idToken, uid } = await signIn();

const adminProfile = await getDocument(idToken, `users/${uid}`);
const adminProfileId = adminProfile?.id
  ? fromFirestoreValue(adminProfile.id)
  : 1;

console.log(`Seeding ${mockEvents.length} events as user id ${adminProfileId} ...`);

for (const evt of mockEvents) {
  const gradient = palette[evt.category] ?? ["#444", "#888"];
  const image = buildSvgDataUrl(evt.title, gradient);
  const payload = {
    ...evt,
    image,
    createdBy: adminProfileId,
  };

  await setDocument(idToken, `events/${evt.id}`, payload);
  console.log(`  ✓ ${evt.id} — ${evt.title}`);
}

console.log(`\nSeeded ${mockEvents.length} events.`);
process.exit(0);
