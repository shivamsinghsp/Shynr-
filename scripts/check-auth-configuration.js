require('dotenv').config();

console.log("--- Auth Environment Diagnostic ---");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "(Present)" : "(Missing)");
console.log("-----------------------------------");

if (!process.env.NEXTAUTH_URL) {
    console.error("ERROR: NEXTAUTH_URL is missing!");
}
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("ERROR: GOOGLE_CLIENT_ID is missing!");
} else if (process.env.GOOGLE_CLIENT_ID.trim() !== process.env.GOOGLE_CLIENT_ID) {
    console.warn("WARNING: GOOGLE_CLIENT_ID has leading/trailing spaces!");
}
