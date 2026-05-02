
import { buildApp } from "./server";

async function startServer() {
  const app = buildApp();

  try {
    await app.listen({ 
      port: Number(3000), 
      host: "0.0.0.0" 
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
