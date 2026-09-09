import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
app.use(express.static(path.join(__dirname,"dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
const server=createServer(app);
const wss=new WebSocketServer({server});
const clients=new Map();

function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data))}
function broadcast(data,except){for(const [id,ws] of clients)if(id!==except)send(ws,data)}

wss.on("connection",ws=>{
  const id=crypto.randomUUID();
  clients.set(id,ws);
  send(ws,{type:"welcome",id,users:clients.size});
  broadcast({type:"users",count:clients.size});
  ws.on("message",raw=>{
    let d; try{d=JSON.parse(raw)}catch{return}
    if(d.type==="chat")broadcast({type:"chat",name:String(d.name||"익명"),text:String(d.text||"")});
    if(["offer","answer","ice"].includes(d.type)){
      const target=clients.get(d.target);
      if(target)send(target,{...d,senderId:id});
    }
  });
  ws.on("close",()=>{clients.delete(id);broadcast({type:"users",count:clients.size})});
});
const port=process.env.PORT||3000;
server.listen(port,()=>console.log("server running on "+port));
