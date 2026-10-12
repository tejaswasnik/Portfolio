import readline from "node:readline";
import { getClient } from "../src/lib/db/client.js";
import { hashPassword } from "../src/lib/auth/password.js";
import { upsertAdminUser } from "../src/lib/db/collections/users.js";
import dns from "dns"

dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Creates/updates the single admin user from ADMIN_EMAIL and a
 * stdin-prompted password (README: "npm run seed:admin"). Hidden-input
 * prompt via a muted readline output stream — no new dependency.
 */
function promptPassword(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // Mutes echoed keystrokes after the prompt text itself, so the
    // password isn't visible on screen — Node's readline has no
    // built-in hidden-input mode; this is the standard workaround.
    let muted = false;
    rl.output.write = (function writeToOutput(original) {
      return function patched(chunk, ...rest) {
        if (!muted) return original.call(rl.output, chunk, ...rest);
        return true;
      };
    })(rl.output.write.bind(rl.output));

    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function run() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set. Add it to .env.local first.");
  }

  const password = await promptPassword(`Password for ${email}: `);
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const client = await getClient();
  const db = client.db();
  const passwordHash = await hashPassword(password);
  await upsertAdminUser(db, { email, passwordHash });
  await client.close();
}

run()
  .then(() => {
    console.log("Admin user ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed admin user:", error.message);
    process.exit(1);
  });
