import{useState,useRef,useCallback}from'react'
  interface Color{hex:string;rgb:string;pct:number}
  function hsl(hex:string){
    const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2
    if(mx===mn)return"hsl(0,0%,"+Math.round(l*100)+"%)"
    const d=mx-mn,s=l>0.5?d/(2-mx-mn):d/(mx+mn)
    let h=0;if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4
    return"hsl("+Math.round(h*60)+","+Math.round(s*100)+"%,"+Math.round(l*100)+"%)"
  }
  function extract(canvas:HTMLCanvasElement,n=8):Color[]{
    const ctx=canvas.getContext("2d")!,{width:w,height:h}=canvas
    const data=ctx.getImageData(0,0,w,h).data
    const map=new Map<string,number>()
    const step=Math.max(1,Math.floor(data.length/4/3000))
    let total=0
    for(let i=0;i<data.length;i+=4*step){
      if(data[i+3]<128)continue
      const r=Math.round(data[i]/16)*16,g=Math.round(data[i+1]/16)*16,b=Math.round(data[i+2]/16)*16
      const hex="#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("")
      map.set(hex,(map.get(hex)||0)+1);total++
    }
    return Array.from(map.entries()).sort(([,a],[,b])=>b-a).slice(0,n).map(([hex,cnt])=>{
      const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
      return{hex,rgb:"rgb("+r+", "+g+", "+b+")",pct:Math.round((cnt/total)*100*8)}
    })
  }
  export default function App(){
    const[colors,setColors]=useState<Color[]>([])
    const[img,setImg]=useState("")
    const[drag,setDrag]=useState(false)
    const[cp,setCp]=useState("")
    const canvasRef=useRef<HTMLCanvasElement>(null)
    const process=(file:File)=>{
      const url=URL.createObjectURL(file);setImg(url)
      const image=new Image()
      image.onload=()=>{
        const c=canvasRef.current!
        c.width=Math.min(image.width,400)
        c.height=Math.round(image.height*(c.width/image.width))
        c.getContext("2d")!.drawImage(image,0,0,c.width,c.height)
        setColors(extract(c))
      }
      image.src=url
    }
    const onFile=(e:React.ChangeEvent<HTMLInputElement>)=>e.target.files?.[0]&&process(e.target.files[0])
    const onDrop=useCallback((e:React.DragEvent)=>{e.preventDefault();setDrag(false);e.dataTransfer.files[0]&&process(e.dataTransfer.files[0])},[])
    const copy=(hex:string)=>{navigator.clipboard.writeText(hex);setCp(hex);setTimeout(()=>setCp(""),2000)}
    return(
      <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"Inter,system-ui,sans-serif",color:"#e2e8f0",padding:"2rem"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <h1 style={{fontWeight:800,fontSize:"1.75rem",marginBottom:"0.5rem",color:"#f8fafc",textAlign:"center"}}>🎨 Image Color Extractor</h1>
          <p style={{color:"#94a3b8",textAlign:"center",marginBottom:"2rem",fontSize:"0.9rem"}}>Upload any image to extract its dominant color palette</p>
          <canvas ref={canvasRef} style={{display:"none"}}/>
          {!img?(
            <label onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
              style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"2px dashed "+(drag?"#38bdf8":"#334155"),borderRadius:16,padding:"5rem 2rem",cursor:"pointer",background:drag?"#0c1a2e":"transparent",transition:"all 0.2s"}}>
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🖼️</div>
              <p style={{fontWeight:600,color:"#f1f5f9",marginBottom:"0.5rem"}}>Drop an image here</p>
              <p style={{color:"#475569",fontSize:"0.85rem"}}>or click to browse · PNG, JPG, WebP</p>
              <input type="file" accept="image/*" onChange={onFile} style={{display:"none"}}/>
            </label>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",alignItems:"start"}}>
              <div>
                <img src={img} alt="src" style={{width:"100%",borderRadius:12,border:"1px solid #1e293b"}}/>
                <label style={{display:"block",marginTop:"1rem",padding:"0.6rem",background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:8,cursor:"pointer",textAlign:"center",fontSize:"0.85rem"}}>
                  Change Image <input type="file" accept="image/*" onChange={onFile} style={{display:"none"}}/>
                </label>
              </div>
              <div>
                <h2 style={{fontWeight:700,marginBottom:"1rem",color:"#94a3b8",fontSize:"0.8rem",letterSpacing:"0.05em"}}>PALETTE ({colors.length} colors)</h2>
                <div style={{display:"flex",height:52,borderRadius:10,overflow:"hidden",marginBottom:"1.5rem",border:"1px solid #1e293b"}}>
                  {colors.map(c=><div key={c.hex} style={{flex:1,background:c.hex}}/>)}
                </div>
                {colors.map(c=>(
                  <div key={c.hex} style={{display:"flex",alignItems:"center",gap:"0.75rem",background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"0.65rem 1rem",marginBottom:"0.6rem"}}>
                    <div style={{width:38,height:38,borderRadius:6,background:c.hex,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:"0.9rem"}}>{c.hex.toUpperCase()}</div>
                      <div style={{color:"#475569",fontSize:"0.72rem"}}>{c.rgb} · {hsl(c.hex)}</div>
                    </div>
                    <button onClick={()=>copy(c.hex)} style={{padding:"0.3rem 0.75rem",background:cp===c.hex?"#166534":"#1e293b",color:cp===c.hex?"#86efac":"#94a3b8",border:"1px solid #334155",borderRadius:6,cursor:"pointer",fontSize:"0.75rem",flexShrink:0}}>{cp===c.hex?"✓ Copied":"Copy"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }