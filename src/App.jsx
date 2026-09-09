import{useEffect,useRef,useState}from"react";import"./App.css";
const ICE={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};
export default function App(){
 const[name,setName]=useState(localStorage.getItem("name")||"나"),[joined,setJoined]=useState(false),[text,setText]=useState(""),[messages,setMessages]=useState([]),[users,setUsers]=useState(0),[sharing,setSharing]=useState(false);
 const ws=useRef(null),myId=useRef(null),stream=useRef(null),video=useRef(null),peers=useRef(new Map());
 const send=d=>ws.current?.readyState===1&&ws.current.send(JSON.stringify(d));
 useEffect(()=>{if(!joined)return;localStorage.setItem("name",name);
  const s=new WebSocket(location.protocol==="https:"?`wss://${location.host}`:`ws://${location.host}`);ws.current=s;
  s.onmessage=async e=>{const d=JSON.parse(e.data);if(d.type==="welcome"){myId.current=d.id;setUsers(d.users)}if(d.type==="users")setUsers(d.count);if(d.type==="chat")setMessages(v=>[...v,{id:crypto.randomUUID(),name:d.name,text:d.text,mine:false}]);if(d.type==="offer")await offer(d);if(d.type==="answer")await answer(d);if(d.type==="ice")await ice(d)};
  return()=>s.close();
 },[joined]);
 const peer=async target=>{if(peers.current.has(target))return peers.current.get(target);const p=new RTCPeerConnection(ICE);peers.current.set(target,p);stream.current?.getTracks().forEach(t=>p.addTrack(t,stream.current));p.onicecandidate=e=>e.candidate&&send({type:"ice",target,candidate:e.candidate});return p};
 const offer=async d=>{const p=await peer(d.senderId);await p.setRemoteDescription(d.offer);const a=await p.createAnswer();await p.setLocalDescription(a);send({type:"answer",target:d.senderId,answer:a})};
 const answer=async d=>{const p=peers.current.get(d.senderId);if(p)await p.setRemoteDescription(d.answer)};
 const ice=async d=>{const p=peers.current.get(d.senderId);if(p)try{await p.addIceCandidate(d.candidate)}catch{}};
 const share=async()=>{try{const st=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});stream.current=st;video.current.srcObject=st;setSharing(true);st.getVideoTracks()[0].onended=stop;for(const[target,p]of peers.current){st.getTracks().forEach(t=>p.addTrack(t,st));const o=await p.createOffer();await p.setLocalDescription(o);send({type:"offer",target,offer:o})}}catch{}};
 const stop=()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(video.current)video.current.srcObject=null;setSharing(false)};
 const sendMsg=()=>{if(!text.trim())return;const t=text.trim();setMessages(v=>[...v,{id:crypto.randomUUID(),name:"나",text:t,mine:true}]);send({type:"chat",name,text:t});setText("")};
 if(!joined)return <div className="app"><div className="join"><div className="icon">💬</div><h1>우리 채팅방</h1><p>링크만 공유하면 친구도 접속할 수 있어요</p><input value={name} onChange={e=>setName(e.target.value)} placeholder="닉네임"/><button onClick={()=>setJoined(true)}>입장하기</button><small>인터넷에 배포한 뒤에는 친구가 Node.js를 설치할 필요가 없습니다.</small></div></div>;
 return <div className="app"><section className="chat"><header><div><h1>우리 채팅방</h1><span>🟢 온라인 {users}명</span></div><button className={sharing?"stop":""} onClick={sharing?stop:share}>🖥️ {sharing?"공유 중지":"화면공유"}</button></header>{sharing&&<div className="share"><div>🔴 내 화면 공유 중</div><video ref={video} autoPlay muted playsInline/></div>}<main>{messages.map(m=><div className={"msg "+(m.mine?"mine":"")} key={m.id}>{!m.mine&&<b>{m.name}</b>}<div className="bubble">{m.text}</div></div>)}</main><footer><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="메시지를 입력하세요"/><button onClick={sendMsg}>전송</button></footer></section></div>
}