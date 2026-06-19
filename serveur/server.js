/* ============================================================
   ANIME TCG — SERVEUR DE SALONS 1v1 (relais simple)
   Rôle : mettre deux joueurs en relation via un code de salon,
   puis relayer les messages de l'un vers l'autre. Le serveur
   n'arbitre pas la partie : l'hôte fait autorité.
   ============================================================ */
const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;

// salons en mémoire : { CODE: { host: ws, guest: ws|null, createdAt } }
const rooms = new Map();

function makeCode(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I,O,0,1 ambigus
  let code;
  do {
    code = "";
    for(let i=0;i<4;i++) code += chars[Math.floor(Math.random()*chars.length)];
  } while(rooms.has(code));
  return code;
}

function send(ws, obj){
  if(ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

// petite page d'accueil pour vérifier que le serveur tourne
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Serveur ANIME TCG en ligne. Salons actifs : " + rooms.size);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.role = null;   // "host" | "guest"
  ws.code = null;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch(e){ return; }

    // --- créer un salon ---
    if(msg.type === "create"){
      const code = makeCode();
      rooms.set(code, { host: ws, guest: null, createdAt: Date.now() });
      ws.role = "host"; ws.code = code;
      send(ws, { type: "created", code });
      return;
    }

    // --- rejoindre un salon ---
    if(msg.type === "join"){
      const code = (msg.code || "").toUpperCase().trim();
      const room = rooms.get(code);
      if(!room){ send(ws, { type: "error", reason: "Code introuvable." }); return; }
      if(room.guest){ send(ws, { type: "error", reason: "Ce salon est déjà complet." }); return; }
      room.guest = ws; ws.role = "guest"; ws.code = code;
      send(ws, { type: "joined", code });
      // prévenir les deux que la partie peut démarrer
      send(room.host, { type: "peer-joined" });
      send(room.guest, { type: "peer-joined" });
      return;
    }

    // --- relais de tout le reste vers l'autre joueur ---
    if(msg.type === "relay"){
      const room = rooms.get(ws.code);
      if(!room) return;
      const peer = (ws.role === "host") ? room.guest : room.host;
      send(peer, { type: "relay", payload: msg.payload });
      return;
    }
  });

  ws.on("close", () => {
    const room = rooms.get(ws.code);
    if(!room) return;
    const peer = (ws.role === "host") ? room.guest : room.host;
    send(peer, { type: "peer-left" });
    // si l'hôte part, on ferme le salon ; si l'invité part, on libère la place
    if(ws.role === "host") rooms.delete(ws.code);
    else if(room.guest === ws) room.guest = null;
  });
});

// nettoyage des salons vides/anciens (toutes les 10 min)
setInterval(() => {
  const now = Date.now();
  for(const [code, room] of rooms){
    const dead = (!room.host || room.host.readyState !== room.host.OPEN);
    const old = now - room.createdAt > 1000 * 60 * 60; // 1h
    if(dead || old) rooms.delete(code);
  }
}, 1000 * 60 * 10);

server.listen(PORT, () => {
  console.log("Serveur ANIME TCG démarré sur le port " + PORT);
});
