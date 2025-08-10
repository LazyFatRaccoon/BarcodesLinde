if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config"); // підтягує .env лише локально
}

import app from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";
import { ensureDefaultAdmin } from "./seed/admin.seed.js";

async function main() {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    app.listen(PORT);
    console.log(`Listening on port http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error(error);
  }
}
main();
