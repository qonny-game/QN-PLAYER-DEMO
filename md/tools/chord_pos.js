// node chord_pos.js <src> <f32> <sr> [cachejson]: 区切り位置の拍からのずれを集計(snap有無)
const fs=require('fs');const core=require(process.argv[2]+'/JS/qn-chord-core.js');
const f=process.argv[3], sr=+process.argv[4], cj=f.replace(/\.f32$/,'')+'.cc.json';
const b=fs.readFileSync(f);const m=new Float32Array(b.buffer,b.byteOffset,b.length/4);const dur=m.length/sr;
let ch,bi;
const cp=process.env.CACHE||'/tmp/ccache_'+require('path').basename(f)+'.json';
if(fs.existsSync(cp)){const o=JSON.parse(fs.readFileSync(cp));ch={frames:o.frames,hop:o.hop,win:o.win,chroma:Float32Array.from(o.chroma),bass:Float32Array.from(o.bass),rms:Float32Array.from(o.rms)};bi={times:Float32Array.from(o.bt),on:Float32Array.from(o.bo),mid:Float32Array.from(o.bm),low:Float32Array.from(o.bl),period:o.bp,bpm:o.bpm};}
else{ch=core.chroma(m,sr);bi=core.beats(m,sr);fs.writeFileSync(cp,JSON.stringify({frames:ch.frames,hop:ch.hop,win:ch.win,chroma:Array.from(ch.chroma),bass:Array.from(ch.bass||[]),rms:Array.from(ch.rms),bt:Array.from(bi.times),bo:Array.from(bi.on),bm:Array.from(bi.mid),bl:Array.from(bi.low),bp:bi.period,bpm:bi.bpm}));}
const g0=core.bars(bi,null,{},dur);const heads=[];for(let i=0;i<g0.times.length;i++)if(g0.bar[i]===0)heads.push(g0.times[i]);
const gr={times:bi.times,mid:bi.mid,on:bi.on,period:bi.period,heads:process.env.NOHEAD?null:Float32Array.from(heads)};
function stats(segs){const T=bi.times,P=bi.period;let n=0,on=0,off=0,free=0,sum=0,hd=0;const H=heads;const hist=[0,0,0,0,0];
 for(let i=1;i<segs.length;i++){const t=segs[i].t0;let d=1e9,dm=1e9;for(let k=0;k<T.length;k++){const x=Math.abs(T[k]-t);if(x<d)d=x;if(k+1<T.length){const y=Math.abs((T[k]+T[k+1])/2-t);if(y<dm)dm=y;}}
  n++;const f=d/P;let dhh=1e9;for(const h of H){const x=Math.abs(h-t);if(x<dhh)dhh=x;}if(dhh<=0.04)hd++;if(d<=0.04)on++;else if(dm<=0.04)off++;else free++;sum+=d;hist[Math.min(4,Math.floor(f*8))]++;}
 return {n,onHead:hd,onBeat:on,offBeat:off,free,meanDev:(sum/n).toFixed(3),segs:segs.length};}
const noSnap=core.classify(ch,dur,{detail:'extended'});
const snap=core.classify(ch,dur,{detail:'extended',grid:gr});
console.log('bpm',bi.bpm.toFixed(1),'period',bi.period.toFixed(3));
console.log('nosnap',JSON.stringify(stats(noSnap.segments)));
console.log('snap  ',JSON.stringify(stats(snap.segments)));

function agree(a,b){let t=0,s=0;const st=0.05;for(let x=0;x<dur;x+=st){const f=(L)=>{for(const g of L)if(x>=g.t0&&x<g.t1)return g.name.split('/')[0];return 'N'};t++;if(f(a)===f(b))s++;}return (s/t*100).toFixed(1)+'%';}
console.log('agree snap~nosnap',agree(snap.segments,noSnap.segments));

function fit(L){let w=0,c=0;for(const g of L){if(g.root<0)continue;const d=g.t1-g.t0;w+=d;c+=d*g.conf;}return (c/w).toFixed(4);}
console.log('fit nosnap',fit(noSnap.segments),'snap',fit(snap.segments));
