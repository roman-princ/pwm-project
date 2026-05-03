import fs from "node:fs";
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
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_DATABASE_URL",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

const missing = requiredKeys.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

const parseEmails = (raw) =>
  (raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const devAdminEmails = parseEmails(process.env.ADMIN_EMAILS);
const prodAdminEmails = parseEmails(
  process.env.ADMIN_EMAILS_PROD ?? process.env.ADMIN_EMAILS,
);

const firebase = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const toTs = (value) => JSON.stringify(value, null, 2);

const devFile = `export const generatedEnvironment = {
  firebase: ${toTs(firebase)},
  adminEmails: ${toTs(devAdminEmails)},
};
`;

const prodFile = `export const generatedEnvironmentProd = {
  firebase: ${toTs(firebase)},
  adminEmails: ${toTs(prodAdminEmails)},
};
`;

const envDir = path.join(projectRoot, "src", "environments");
fs.writeFileSync(
  path.join(envDir, "environment.generated.ts"),
  devFile,
  "utf8",
);
fs.writeFileSync(
  path.join(envDir, "environment.generated.prod.ts"),
  prodFile,
  "utf8",
);

console.log("Generated Angular environment files from .env");
