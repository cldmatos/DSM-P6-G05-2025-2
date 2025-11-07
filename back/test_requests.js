const http = require("http");
const app = require("./src/index");

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data || "{}");
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

(async () => {
  const server = app.listen(3000, async () => {
    try {
      console.log("Servidor de teste iniciado em 3000");

      console.log("GET /api/entries (antes)");
      const getBefore = await request({
        hostname: "localhost",
        port: 3000,
        path: "/api/entries",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(getBefore);

      console.log("\nPOST /api/entries");
      const post = await request(
        {
          hostname: "localhost",
          port: 3000,
          path: "/api/entries",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        { nome: "João", idade: 30, valor: 100.5 }
      );
      console.log(post);

      console.log("\nGET /api/entries (depois)");
      const getAfter = await request({
        hostname: "localhost",
        port: 3000,
        path: "/api/entries",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(getAfter);

      server.close(() => {
        console.log("Servidor de teste finalizado");
        process.exit(0);
      });
    } catch (err) {
      console.error("Erro nos testes:", err);
      server.close(() => process.exit(1));
    }
  });
})();
