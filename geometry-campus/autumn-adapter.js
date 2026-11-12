// Original JLU leaf controller; canvas pool and same-footpoint seasonal swapping are host adapters.
import {OriginalFallingLeaves} from '../assets/jlu-interactive-autumn/original-falling-leaves.mjs';
export async function createAutumn(props){
 const study=false;
 const base='../assets/jlu-interactive-autumn/',metadata=await fetch(base+'metadata.json').then(r=>r.json()),art=new Map();
 await Promise.all(metadata.filter(m=>m.name.startsWith('leaf-')||m.name.endsWith('-autumn')).map(async m=>{const image=new Image();image.src=base+'png/'+m.name+'.png';await image.decode();art.set(m.name,{...m,image})}));
 const variants=await fetch('../assets/jlu-autumn-study/metadata.json').then(r=>r.json());await Promise.all(variants.filter(m=>m.ax!==undefined).map(async m=>{const image=new Image();image.src='../assets/jlu-autumn-study/'+m.name+'.png';await image.decode();art.set(m.name,{...m,image})}));
 const saved=new Map();for(const p of props.items){const name=p.name;const kind=p.originalKind||(/pine|spruce/.test(name)?'spruce':/willow/.test(name)?'willow':/poplar/.test(name)?'poplar':/large-tree|tree-main|front-canopy/.test(name)?'oak':/tree-summer/.test(name)?'tree':/bush|shrub/.test(name)?'bush':null);if(!kind)continue;p.seasonKind=kind;if(kind==='spruce')continue;const seed=((Math.round(p.x*6)*31+Math.round(p.y*6)*17)%6+6)%6,key=kind+'-autumn-'+seed;if(!art.has(key))continue;saved.set(p,p.name);p.autumnName=key;props.art.set(key,art.get(key));p.renderName=key}
 const sprites=new Set(),region={changed:true};let enabled=true;
 const sky={get(anim,x,y){const s={frame:anim.frames[0],x,y,alpha:1,setFrame(f){this.frame=f},setPosition(x,y){this.x=x;this.y=y},setAlpha(a){this.alpha=a}};sprites.add(s);return s},put(s){sprites.delete(s)}};
 const world={arts:new Map(['oak','tree','poplar','willow','bush'].map(kind=>[kind,{kind}])),props:[...saved.keys()].map(p=>({x:p.x*6,y:p.y*6,art:p.seasonKind}))};
 const leaves=new OriginalFallingLeaves({anim:name=>({frames:Array.from({length:5},(_,i)=>name+'-'+i)}),cap:n=>n,world,campus:()=>true,env:{season:'autumn',wind:{x:2,y:.6}},region,sky,behind:()=>false});
 return {toggle(){enabled=!enabled;for(const[p,name]of saved)p.renderName=enabled?p.autumnName:null;leaves.clear();return enabled},update(t,dt,v){if(!enabled)return;region.changed=true;leaves.update(t,Math.min(.1,dt),{left:v.x*6,top:v.y*6,right:(v.x+v.w)*6,bottom:(v.y+v.h)*6})},clear(){leaves.clear()},objects(){return [...sprites].map(s=>({y:s.y/6+.1,draw(c){const a=art.get(s.frame);if(!a)return;c.save();c.globalAlpha=s.alpha;c.drawImage(a.image,(s.x-a.ax)/6,(s.y-a.ay)/6,a.w/6,a.h/6);c.restore()}}))},stats:()=>({enabled,seasonalTrees:saved.size,leaves:sprites.size,cap:28,controller:'original JLU gN; host canvas adapter',fullGroundSeason:true,multiSeedStudy:study})};
}
