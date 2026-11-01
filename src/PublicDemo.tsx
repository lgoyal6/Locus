import { useState } from "react";
import { runWalks, mulberry32 } from "../convex/simWalker";
import { PROFILES, type Profile } from "../convex/profiles";
import type { Doc, Id } from "../convex/_generated/dataModel";

const caseId = "public-fictional-case" as Id<"cases">;
const caseDoc: Doc<"cases"> = {
  _id: caseId, _creationTime: 0, name: "Fictional visitor scenario", subjectFacts: "Synthetic simulation inputs only",
  lastKnownLat: 37.91, lastKnownLng: -122.61, boundsSwLat: 37.89, boundsSwLng: -122.64,
  boundsNeLat: 37.94, boundsNeLng: -122.58, gridSize: 24, terrainCells: [], landmarks: [],
  hiddenTrueLat: 37.92, hiddenTrueLng: -122.60, status: "active",
};
export default function PublicDemo() {
  const [profile,setProfile]=useState<Profile["key"]>("hiker");
  const [minutes,setMinutes]=useState(120);
  const [tip,setTip]=useState(false);
  const [seed,setSeed]=useState(7);
  const [result,setResult]=useState<number[][]|null>(null);
  const [selected,setSelected]=useState<{x:number;y:number}|null>(null);
  function run(){
    const p=PROFILES[profile];
    const hypotheses: Doc<"hypotheses">[]=[{_id:"demo-hypothesis" as Id<"hypotheses">,_creationTime:0,caseId,profile,weight:1,reasoning:"Visitor-selected fixed profile",behaviorWeights:p.behaviorWeights,mobilityKmH:p.mobilityKmH,terrainAffinity:p.terrainAffinity,updatedAt:0}];
    const tips: Doc<"tips">[]=tip?[{_id:"demo-tip" as Id<"tips">,_creationTime:0,caseId,lat:37.92,lng:-122.60,weight:1,credibility:1,observedAtSimMin:minutes-10,text:"Fictional sighting, 10 simulated minutes ago",source:"public-demo",createdAt:0} as Doc<"tips">]:[];
    const heat=runWalks(caseDoc,hypotheses,tips,minutes,mulberry32(seed));
    const total=heat.flat().reduce((a,b)=>a+b,0);
    setResult(heat.map(row=>row.map(value=>total?value/total:0)));setSelected(null);
  }
  function reset(){setProfile("hiker");setMinutes(120);setTip(false);setSeed(7);setResult(null);setSelected(null);}
  const maximum=result?Math.max(...result.flat()):1;
  return <main className="mx-auto max-w-5xl p-6 text-foreground">
    <nav className="flex gap-5"><a href="/">LOCUS command center</a><a href="https://github.com/lgoyal6/Locus">GitHub</a></nav>
    <h1 className="mt-8 text-3xl font-bold">Where does the search hypothesis put probability?</h1>
    <p className="my-4">Run LOCUS’s original seeded Monte Carlo walker on a fictional area. Change the assumed behavior, elapsed time or a fixed recent sighting and inspect how the probability moves.</p>
    <p className="my-4 text-muted-foreground">Isolated browser computation. No shared case, voice service, AI provider or Convex connection. The terrain is uniformly open. These illustrative hypotheses are not a validated rescue plan. Scenario date: November 1, 2026; elapsed time is simulated.</p>
    <section className="my-6 flex flex-wrap gap-5 rounded-xl border p-5">
      <label>Behavior profile <select aria-label="Behavior profile" value={profile} onChange={e=>{setProfile(e.target.value as Profile["key"]);setResult(null);}}>{Object.values(PROFILES).map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
      <label>Elapsed minutes <input aria-label="Elapsed minutes" type="number" min="15" max="480" value={minutes} onChange={e=>{setMinutes(Math.max(15,Math.min(480,Number(e.target.value)||15)));setResult(null);}} /></label>
      <label>Seed <input aria-label="Seed" type="number" min="0" max="9999" value={seed} onChange={e=>{setSeed(Math.max(0,Math.min(9999,Number(e.target.value)||0)));setResult(null);}} /></label>
      <label><input type="checkbox" checked={tip} onChange={e=>{setTip(e.target.checked);setResult(null);}} /> Include fictional recent sighting</label>
      <button onClick={run}>Run scenario</button><button onClick={reset}>Reset sample</button>
    </section>
    <p role="status">{result?`Computed ${result.length*result.length} cells using the original walker. Select a cell to inspect its normalized simulated mass.`:"Inputs ready. Run the scenario to compute a fresh result."}</p>
    {result&&<div className="my-5 grid max-w-2xl" style={{gridTemplateColumns:`repeat(${caseDoc.gridSize},1fr)`}} aria-label="Simulated probability grid">{[...result].reverse().flatMap((row,ry)=>row.map((value,x)=>{const y=caseDoc.gridSize-1-ry;return <button key={`${x},${y}`} aria-label={`Cell ${x},${y}: ${(value*100).toFixed(3)} percent`} onClick={()=>setSelected({x,y})} style={{aspectRatio:1,background:`rgba(40,170,140,${0.1+0.9*value/maximum})`,border:selected?.x===x&&selected.y===y?'2px solid white':'1px solid #20342f'}} />;}))}</div>}
    {selected&&result&&<p>Cell {selected.x}, {selected.y}: {(result[selected.y][selected.x]*100).toFixed(3)}% normalized simulation mass. This is model output under the selected assumptions, not a measured location probability.</p>}
    <p className="mt-6 text-muted-foreground">Hiker behavior weights come from the cited model; the other profile mixtures are project estimates. <a className="underline" href="https://github.com/lgoyal6/Locus/blob/main/convex/profiles.ts">Inspect profiles and sources</a>.</p>
  </main>;
}
