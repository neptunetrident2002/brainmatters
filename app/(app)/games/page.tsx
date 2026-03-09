"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const C = {
  orange: "#E8520A", orangeLight: "#FFF0E8", dark: "#1A1208",
  mid: "#5A4A2A", muted: "#8A7A5A", border: "#C8B89A",
  bg: "#F5F0E8", card: "#FFFEF9", cream: "#FAF6F0",
  success: "#2E7D32", successLight: "#E8F5E9",
  red: "#C62828", redLight: "#e87070", greenLight: "#70c878",
  gold: "#c9a84c", goldDim: "#8a6f2e",
};

// ─── TIC-TAC-TOE (from MindGate) ─────────────────────────────────────────────
const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function tttWinner(b: (string|null)[]) {
  for (const [a,bb,c] of TTT_LINES)
    if (b[a] && b[a]===b[bb] && b[a]===b[c]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

function tttWinLine(b: (string|null)[]) {
  for (const l of TTT_LINES) {
    const [a,bb,c]=l;
    if (b[a]&&b[a]===b[bb]&&b[a]===b[c]) return l;
  }
  return null;
}

function TicTacToe() {
  const [board, setBoard] = useState<(string|null)[]>(Array(9).fill(null));
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<string|null>(null);
  const [wl, setWl] = useState<number[]|null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState({ w:0, l:0, d:0 });

  function resolve(b: (string|null)[], w: string, line: number[]|null) {
    const r = w==="X" ? "win" : w==="draw" ? "draw" : "loss";
    setResult(r); setWl(line); setDone(true); setBusy(false);
    setScore(s => ({ w: s.w+(r==="win"?1:0), l: s.l+(r==="loss"?1:0), d: s.d+(r==="draw"?1:0) }));
  }

  function click(i: number) {
    if (board[i]||done||busy) return;
    const b=[...board]; b[i]="X";
    const w=tttWinner(b); const line=tttWinLine(b);
    setBoard(b);
    if (w) { resolve(b,w,line); return; }
    setBusy(true);
    setTimeout(()=>{
      const b2=[...b];
      const mv=[0,1,2,3,4,5,6,7,8].filter(x=>!b2[x]);
      if (mv.length) {
        b2[mv[Math.floor(Math.random()*mv.length)]]="O";
        const w2=tttWinner(b2); const l2=tttWinLine(b2);
        setBoard(b2);
        if (w2) { resolve(b2,w2,l2); return; }
      }
      setBusy(false);
    }, 420);
  }

  function reset() { setBoard(Array(9).fill(null)); setDone(false); setResult(null); setWl(null); setBusy(false); }

  const statusText = busy ? "AI thinking…" : done
    ? (result==="win" ? "🎉 You win!" : result==="draw" ? "🤝 Draw" : "🤖 AI wins")
    : "Your turn — you are X";

  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Tic-Tac-Toe</h3>
        <div style={{ fontSize:11, color:C.muted }}>W:<b style={{color:C.success}}>{score.w}</b> L:<b style={{color:C.red}}>{score.l}</b> D:<b style={{color:C.muted}}>{score.d}</b></div>
      </div>

      <div style={{ fontSize:12, color:C.orange, fontWeight:700, marginBottom:14, textAlign:"center", fontFamily:"Georgia, serif" }}>{statusText}</div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:4, background:C.dark, padding:4, width:228, margin:"0 auto 20px", borderRadius:6 }}>
        {board.map((cell,i) => {
          const isWin = wl?.includes(i);
          const bg = isWin ? (result==="win" ? C.successLight : "#FECACA") : cell ? C.bg : C.cream;
          return (
            <button key={i} onClick={()=>click(i)} style={{
              width:68, height:68, background:bg, border:"none", borderRadius:4,
              fontFamily:"Georgia, serif", fontSize:32, fontWeight:700,
              color: cell==="X" ? C.orange : C.mid,
              cursor: cell||done||busy ? "default" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"background .2s",
            }}>
              {cell||""}
            </button>
          );
        })}
      </div>

      <div style={{ textAlign:"center" }}>
        <button onClick={reset} style={{ padding:"7px 20px", background:C.dark, border:"none", borderRadius:7, color:C.cream, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}>
          New Game
        </button>
      </div>
    </div>
  );
}

// ─── DOTS & BOXES (full RL version) ──────────────────────────────────────────
const GRID_OPTIONS = [3,4,5];
const CELL=64, DOT=8, LINE_W=10;

const PLAYERS = [
  { id:0, name:"You",      color:"#E8520A", light:"#FFF0E8", label:"P1" },
  { id:1, name:"Player 2", color:"#5A4A2A", light:"#E8E0D0", label:"P2" },
];
const AI_META = { ...PLAYERS[1], name:"AI" };

const FEATURE_COUNT=5;
const FEATURE_NAMES=["Completes Boxes","Gives 3rd Side","Chain Giveaway","Safe Move","Edge Bonus"];
const INIT_WEIGHTS=[12.0,-9.0,-4.0,2.5,0.8];
const RL_ALPHA=0.08, RL_GAMMA=0.92, RL_EPS_START=0.18, RL_EPS_MIN=0.04, RL_EPS_DECAY=0.94;

function loadRL() {
  try { const s=localStorage.getItem("dnb_rl_v3"); if(s) return JSON.parse(s); } catch {}
  return { weights:[...INIT_WEIGHTS], games:0, wins:0, epsilon:RL_EPS_START };
}
function saveRL(rl: any) { try { localStorage.setItem("dnb_rl_v3",JSON.stringify(rl)); } catch {} }
function freshRL() { return { weights:[...INIT_WEIGHTS], games:0, wins:0, epsilon:RL_EPS_START }; }

function initState(size: number) {
  return {
    hLines: Array.from({length:size+1},()=>Array(size).fill(null)),
    vLines: Array.from({length:size},()=>Array(size+1).fill(null)),
    boxes:  Array.from({length:size},()=>Array(size).fill(null)),
    current:0, scores:[0,0], done:false,
  };
}

function countSides(hLines: any[][], vLines: any[][], r: number, c: number) {
  return (hLines[r][c]!==null?1:0)+(hLines[r+1][c]!==null?1:0)+(vLines[r][c]!==null?1:0)+(vLines[r][c+1]!==null?1:0);
}

function getAdjBoxes(type: string, r: number, c: number, size: number) {
  return type==="h"
    ? [[r-1,c],[r,c]].filter(([br])=>br>=0&&br<size)
    : [[r,c-1],[r,c]].filter(([,bc])=>bc>=0&&bc<size);
}

function applyLine(hLines: any[][], vLines: any[][], type: string, r: number, c: number, player: number) {
  const H=hLines.map(row=>[...row]), V=vLines.map(row=>[...row]);
  if(type==="h") H[r][c]=player; else V[r][c]=player;
  return [H,V];
}

function claimBoxes(hLines: any[][], vLines: any[][], boxes: any[][], size: number, player: number) {
  let scored=0; const nb=boxes.map(r=>[...r]);
  for(let r=0;r<size;r++) for(let c=0;c<size;c++)
    if(nb[r][c]===null&&countSides(hLines,vLines,r,c)===4) { nb[r][c]=player; scored++; }
  return {nb,scored};
}

function allFilled(hLines: any[][], vLines: any[][], size: number) {
  for(let r=0;r<=size;r++) for(let c=0;c<size;c++) if(hLines[r][c]===null) return false;
  for(let r=0;r<size;r++) for(let c=0;c<=size;c++) if(vLines[r][c]===null) return false;
  return true;
}

function getMoves(hLines: any[][], vLines: any[][], size: number) {
  const moves: any[]=[];
  for(let r=0;r<=size;r++) for(let c=0;c<size;c++) if(hLines[r][c]===null) moves.push({type:"h",r,c});
  for(let r=0;r<size;r++) for(let c=0;c<=size;c++) if(vLines[r][c]===null) moves.push({type:"v",r,c});
  return moves;
}

function getFeatures(type: string, r: number, c: number, hLines: any[][], vLines: any[][], boxes: any[][], size: number) {
  const [H,V]=applyLine(hLines,vLines,type,r,c,1);
  const adj=getAdjBoxes(type,r,c,size);
  let completesBoxes=0, givesThirds=0;
  for(const [br,bc] of adj) {
    if(boxes[br][bc]!==null) continue;
    const before=countSides(hLines,vLines,br,bc), after=countSides(H,V,br,bc);
    if(after===4) completesBoxes++;
    else if(before===2&&after===3) givesThirds++;
  }
  let chainGiveaway=0;
  for(let br=0;br<size;br++) for(let bc=0;bc<size;bc++)
    if(boxes[br][bc]===null&&countSides(H,V,br,bc)===3) chainGiveaway++;
  const safe=(givesThirds===0&&completesBoxes===0)?1:0;
  const edge=((type==="h"&&(r===0||r===size))||(type==="v"&&(c===0||c===size)))?1:0;
  return [completesBoxes,givesThirds,chainGiveaway,safe,edge];
}

function qVal(feat: number[], weights: number[]) { return feat.reduce((s,f,i)=>s+f*weights[i],0); }

function pickMove(hLines: any[][], vLines: any[][], boxes: any[][], size: number, rl: any) {
  const moves=getMoves(hLines,vLines,size);
  if(!moves.length) return null;
  if(Math.random()<rl.epsilon) return moves[Math.floor(Math.random()*moves.length)];
  let best: any=null, bestQ=-Infinity;
  for(const mv of moves) {
    const q=qVal(getFeatures(mv.type,mv.r,mv.c,hLines,vLines,boxes,size),rl.weights);
    if(q>bestQ) { bestQ=q; best=mv; }
  }
  return best;
}

function updateWeights(rl: any, traj: any[], reward: number) {
  const w=[...rl.weights];
  for(let t=traj.length-1;t>=0;t--) {
    const {feat,q}=traj[t];
    const target=reward*Math.pow(RL_GAMMA,traj.length-1-t);
    const err=target-q;
    for(let i=0;i<FEATURE_COUNT;i++) w[i]+=RL_ALPHA*err*feat[i];
  }
  return w;
}

function DotsAndBoxes() {
  const [gridSize, setGridSize] = useState(4);
  const [aiMode, setAiMode] = useState(true);
  const [state, setState] = useState(()=>initState(4));
  const [hover, setHover] = useState<any>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [rl, setRl] = useState(()=>loadRL());
  const [showRl, setShowRl] = useState(false);
  const stateRef = useRef(state);
  const rlRef = useRef(rl);
  const trajRef = useRef<any[]>([]);
  stateRef.current = state;
  rlRef.current = rl;

  useEffect(()=>{ saveRL(rl); },[rl]);

  const doReset = useCallback((sz?: number)=>{
    const s=sz??gridSize; setGridSize(s);
    setState(initState(s)); setHover(null); setAiThinking(false); trajRef.current=[];
  },[gridSize]);

  const applyMove = useCallback((type: string, r: number, c: number, gs: any, sz: number)=>{
    const {hLines,vLines,boxes,current,scores}=gs;
    const [H,V]=applyLine(hLines,vLines,type,r,c,current);
    const {nb,scored}=claimBoxes(H,V,boxes,sz,current);
    const ns=[...scores]; ns[current]+=scored;
    return {hLines:H,vLines:V,boxes:nb,current:scored>0?current:1-current,scores:ns,done:allFilled(H,V,sz)};
  },[]);

  const handleLine = useCallback((type: string, r: number, c: number)=>{
    const s=stateRef.current;
    if(s.done||aiThinking) return;
    if(aiMode&&s.current===1) return;
    if(type==="h"?s.hLines[r][c]!==null:s.vLines[r][c]!==null) return;
    setState(applyMove(type,r,c,s,gridSize));
  },[aiThinking,aiMode,gridSize,applyMove]);

  useEffect(()=>{
    if(!aiMode) return;
    const s=stateRef.current;
    if(s.done||s.current!==1) return;
    setAiThinking(true);
    const t=setTimeout(()=>{
      const cur=stateRef.current;
      if(cur.done||cur.current!==1){setAiThinking(false);return;}
      const mv=pickMove(cur.hLines,cur.vLines,cur.boxes,gridSize,rlRef.current);
      if(!mv){setAiThinking(false);return;}
      const feat=getFeatures(mv.type,mv.r,mv.c,cur.hLines,cur.vLines,cur.boxes,gridSize);
      trajRef.current.push({feat,q:qVal(feat,rlRef.current.weights)});
      setState(applyMove(mv.type,mv.r,mv.c,cur,gridSize));
      setAiThinking(false);
    },400+Math.random()*300);
    return ()=>clearTimeout(t);
  },[state,aiMode,gridSize,applyMove]);

  useEffect(()=>{
    if(!state.done||!aiMode) return;
    const [p1,p2]=state.scores;
    const margin=(p2-p1)/Math.max(1,p1+p2);
    const reward=p2>p1?1.0+margin:p2<p1?-1.0-margin:0;
    const newWeights=trajRef.current.length>0?updateWeights(rl,trajRef.current,reward):rl.weights;
    setRl({weights:newWeights,games:rl.games+1,wins:rl.wins+(p2>p1?1:0),epsilon:Math.max(RL_EPS_MIN,rl.epsilon*RL_EPS_DECAY)});
    trajRef.current=[];
  },[state.done]);

  const {hLines,vLines,boxes,current,scores,done}=state;
  const sz=gridSize, px=sz*CELL+DOT;
  const players=aiMode?[PLAYERS[0],AI_META]:PLAYERS;
  const winner=done?(scores[0]>scores[1]?0:scores[1]>scores[0]?1:"tie"):null;
  const canClick=!done&&!aiThinking&&(!aiMode||current===0);

  return (
    <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:14, padding:24 }}>
      {/* Controls */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Dots & Boxes</h3>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <div style={{ display:"flex", border:`2px solid ${C.border}`, borderRadius:7, overflow:"hidden" }}>
            {[false,true].map(isAi=>(
              <button key={String(isAi)} onClick={()=>{setAiMode(isAi);doReset();}} style={{ padding:"5px 12px", border:"none", cursor:"pointer", fontSize:10, fontWeight:700, background:aiMode===isAi?C.dark:"transparent", color:aiMode===isAi?C.cream:C.mid, fontFamily:"Georgia, serif" }}>
                {isAi?"🤖 vs AI":"👥 2P"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {GRID_OPTIONS.map(g=>(
              <button key={g} onClick={()=>doReset(g)} style={{ width:30, height:30, borderRadius:5, border:`2px solid ${gridSize===g?C.dark:C.border}`, background:gridSize===g?C.dark:"transparent", color:gridSize===g?C.cream:C.mid, fontSize:10, fontWeight:700, cursor:"pointer" }}>{g}×{g}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{ display:"flex", marginBottom:14, border:`1.5px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
        {players.map((p,i)=>(
          <div key={i} style={{ flex:1, padding:"8px 16px", textAlign:"center", background:!done&&current===i?`${p.color}14`:"transparent", borderRight:i===0?`1px solid ${C.border}`:"none", position:"relative" }}>
            {!done&&current===i&&<div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.color }}/>}
            <div style={{ fontSize:10, color:p.color, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>{p.name}</div>
            <div style={{ fontSize:24, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif" }}>{scores[i]}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
        <svg width={px} height={px} style={{ overflow:"visible", filter:"drop-shadow(0 2px 12px rgba(0,0,0,0.08))" }}>
          {boxes.map((row,r)=>row.map((owner,c)=>owner!==null&&(
            <rect key={`b${r}${c}`} x={c*CELL+DOT/2} y={r*CELL+DOT/2} width={CELL} height={CELL} fill={players[owner as number].light} rx={2}/>
          )))}
          {boxes.map((row,r)=>row.map((owner,c)=>owner!==null&&(
            <text key={`l${r}${c}`} x={c*CELL+DOT/2+CELL/2} y={r*CELL+DOT/2+CELL/2+6} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily="Georgia, serif" fill={players[owner as number].color} style={{userSelect:"none"}}>{players[owner as number].label}</text>
          )))}
          {hLines.map((row,r)=>row.map((owner,c)=>{
            const hov=hover?.type==="h"&&hover.r===r&&hover.c===c;
            const x1=c*CELL+DOT, x2=(c+1)*CELL, y=r*CELL+DOT/2;
            return (
              <g key={`h${r}${c}`}>
                <rect x={x1-4} y={y-12} width={x2-x1+8} height={24} fill="transparent" style={{cursor:owner===null&&canClick?"pointer":"default"}}
                  onMouseEnter={()=>owner===null&&canClick&&setHover({type:"h",r,c})} onMouseLeave={()=>setHover(null)} onClick={()=>handleLine("h",r,c)}/>
                {(owner!==null||hov)
                  ? <line x1={x1} y1={y} x2={x2} y2={y} stroke={owner!==null?players[owner as number].color:`${players[current].color}66`} strokeWidth={LINE_W} strokeLinecap="round" style={{pointerEvents:"none"}}/>
                  : <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.border} strokeWidth={2} strokeLinecap="round" strokeDasharray="4 4" style={{pointerEvents:"none"}}/>
                }
              </g>
            );
          }))}
          {vLines.map((row,r)=>row.map((owner,c)=>{
            const hov=hover?.type==="v"&&hover.r===r&&hover.c===c;
            const y1=r*CELL+DOT, y2=(r+1)*CELL, x=c*CELL+DOT/2;
            return (
              <g key={`v${r}${c}`}>
                <rect x={x-12} y={y1-4} width={24} height={y2-y1+8} fill="transparent" style={{cursor:owner===null&&canClick?"pointer":"default"}}
                  onMouseEnter={()=>owner===null&&canClick&&setHover({type:"v",r,c})} onMouseLeave={()=>setHover(null)} onClick={()=>handleLine("v",r,c)}/>
                {(owner!==null||hov)
                  ? <line x1={x} y1={y1} x2={x} y2={y2} stroke={owner!==null?players[owner as number].color:`${players[current].color}66`} strokeWidth={LINE_W} strokeLinecap="round" style={{pointerEvents:"none"}}/>
                  : <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.border} strokeWidth={2} strokeLinecap="round" strokeDasharray="4 4" style={{pointerEvents:"none"}}/>
                }
              </g>
            );
          }))}
          {Array.from({length:sz+1},(_,r)=>Array.from({length:sz+1},(_,c)=>(
            <circle key={`d${r}${c}`} cx={c*CELL+DOT/2} cy={r*CELL+DOT/2} r={DOT/2} fill={C.dark}/>
          )))}
        </svg>
      </div>

      {/* Status */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:12, fontWeight:700, color:done?(winner==="tie"?C.muted:players[winner as number]?.color):players[current].color }}>
          {done
            ? winner==="tie" ? "🤝 It's a tie!" : `${players[winner as number].name} wins! ${scores[0]}–${scores[1]}`
            : aiThinking ? "⚙️ AI thinking…" : `${players[current].name}'s turn`
          }
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {aiMode && <button onClick={()=>setShowRl(v=>!v)} style={{ padding:"5px 10px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:6, color:C.mid, fontSize:10, cursor:"pointer" }}>🧠 AI Stats</button>}
          <button onClick={()=>doReset()} style={{ padding:"5px 14px", background:C.dark, border:"none", borderRadius:6, color:C.cream, fontSize:11, fontWeight:700, cursor:"pointer" }}>New Game</button>
        </div>
      </div>

      {/* RL Stats */}
      {aiMode&&showRl&&(
        <div style={{ marginTop:14, padding:"14px 16px", background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.dark }}>🧠 RL Learning Model</span>
            <button onClick={()=>setRl(freshRL())} style={{ fontSize:9, color:C.red, background:"none", border:`1px solid ${C.red}`, borderRadius:4, cursor:"pointer", padding:"2px 6px" }}>Reset AI</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:12 }}>
            {[["Games",rl.games],["AI Wins",rl.wins],["Win Rate",rl.games>0?`${Math.round(rl.wins/rl.games*100)}%`:"—"]].map(([l,v])=>(
              <div key={l} style={{ textAlign:"center", padding:"7px 4px", background:C.card, borderRadius:5 }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif" }}>{v}</div>
                <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>Learned Feature Weights</div>
          {FEATURE_NAMES.map((name,i)=>{
            const w=rl.weights[i], pct=Math.min(Math.abs(w)/15*100,100);
            return (
              <div key={name} style={{ marginBottom:5 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.mid, marginBottom:2 }}>
                  <span>{name}</span>
                  <span style={{ fontWeight:700, color:w>=0?C.success:C.red }}>{w>=0?"+":""}{w.toFixed(2)}</span>
                </div>
                <div style={{ background:C.border, borderRadius:3, height:4 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:w>=0?"#4caf50":"#ef5350", borderRadius:3, transition:"width 0.4s" }}/>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize:10, color:C.muted, marginTop:8, lineHeight:1.7 }}>
            <b>Exploration ε:</b> {(rl.epsilon*100).toFixed(1)}% random — decays each game. Progress saved in browser.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function GamesPage() {
  const [tab, setTab] = useState<"dab"|"ttt">("dab");

  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Brain Games</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Strategic thinking you can't outsource.</p>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {([["dab","Dots & Boxes"],["ttt","Tic-Tac-Toe"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:"8px 18px", background:tab===id?C.dark:"transparent", border:`1.5px solid ${tab===id?C.dark:C.border}`, borderRadius:8, color:tab===id?C.cream:C.mid, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}>
            {label}
          </button>
        ))}
      </div>

      {tab==="dab" && <DotsAndBoxes/>}
      {tab==="ttt" && <TicTacToe/>}

      <p style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:16, lineHeight:1.7 }}>
        {tab==="dab"
          ? "Click a line between dots to claim it. Complete all 4 sides of a box to score. Most boxes wins."
          : "You are X. Beat the AI. It gets smarter over time."
        }
      </p>
    </div>
  );
}