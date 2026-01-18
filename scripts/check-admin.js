const { ConvexHttpClient } = require("convex/browser");
const client = new ConvexHttpClient("http://127.0.0.1:3210");

async function check() {
    const email = "dj.blaney77@gmail.com";
    console.log("Checking profile for:", email);
    try {
        const profile = await client.query("profiles:getProfileByEmail", { email });
        console.log("Profile found:", profile);
        if (profile) {
            console.log("DATA: userId=" + profile.userId + " is_admin=" + profile.is_admin);
        } else {
            console.log("No profile found for this email.");
        }
    } catch (e) {
        console.error("Error querying:", e);
    }
}

check();
