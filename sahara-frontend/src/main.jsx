import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{ReactFlow,Background,Controls,MiniMap,Handle,Position,useNodesState,useEdgesState,MarkerType}from'@xyflow/react';
import'@xyflow/react/dist/style.css';
import{Shield,LayoutDashboard,Network,FileText,AlertTriangle,Users,UploadCloud,Search,RefreshCw,CheckCircle2,Clock3,ArrowUpRight,LockKeyhole,Activity,ChevronRight,Menu,X,Link2,ScanText,UserRound,KeyRound}from'lucide-react';
import'./styles.css';

const API=import.meta.env.VITE_API_URL||'http://127.0.0.1:8000';
const nav=[
 ['dashboard','Overview',LayoutDashboard],
 ['graph','Dependency Map',Network],
 ['documents','Documents',FileText],
 ['emergency','Emergency Capsule',AlertTriangle]
];

function App(){
 const[page,setPage]=useState('dashboard'),[mobile,setMobile]=useState(false),
 [health,setHealth]=useState(null),[graph,setGraph]=useState(null),[spof,setSpof]=useState([]);

 const load=async()=>{
  try{
   const[g,r]=await Promise.all([
    fetch(API+'/api/v1/graph/visualization'),
    fetch(API+'/api/v1/graph/analyze-risk')
   ]);
   if(g.ok)setGraph(await g.json());
   if(r.ok){
    const d=await r.json();
    setSpof(d.single_points_of_failure||[]);
   }
   setHealth(true);
  }catch(e){
   console.error('[SAHARA]',e);
   setHealth(false);
  }
 };

 useEffect(()=>{load()},[]);

 const stats={
  nodes:graph?.nodes?.length||0,
  links:graph?.edges?.length||0,
  risks:spof.length,
  docs:Math.max(3,graph?.nodes?.filter(n=>n.type==='asset_or_task').length||0)
 };

 return <div className="app">
  <aside className={'sidebar '+(mobile?'open':'')}>
   <div className="brand">
    <div className="brandMark"><Shield size={21}/></div>
    <div><b>SAHARA</b><span>Family Continuity</span></div>
    <button className="iconBtn mobileClose" onClick={()=>setMobile(false)}><X/></button>
   </div>

   <div className="workspace">
    <span className="eyebrow">WORKSPACE</span>
    <div className="family">
     <div className="avatar">RK</div>
     <div><strong>Rohan's Family</strong><small>Protected workspace</small></div>
     <span className="liveDot"/>
    </div>
   </div>

   <nav>
    {nav.map(([id,label,Icon])=><button key={id}
     className={page===id?'active':''}
     onClick={()=>{setPage(id);setMobile(false)}}>
     <Icon size={18}/><span>{label}</span>{id==='emergency'&&<i/>}
    </button>)}
   </nav>

   <div className="sideBottom">
    <div className="security">
     <LockKeyhole size={16}/>
     <div><strong>Vault secured</strong><span>End-to-end protected</span></div>
    </div>
    <div className="user">
     <div className="avatar small">PK</div>
     <div><strong>Priyanshi</strong><span>Primary user</span></div>
     <ChevronRight size={16}/>
    </div>
   </div>
  </aside>

  <main>
   <header>
    <button className="iconBtn menu" onClick={()=>setMobile(true)}><Menu/></button>
    <div className="crumb">
     <span>SAHARA</span><ChevronRight size={14}/>
     <b>{nav.find(x=>x[0]===page)?.[1]}</b>
    </div>
    <div className="headerActions">
     <div className="status">
      <span className={health?'ok':'bad'}/>
      {health===null?'Connecting':health?'System online':'Backend offline'}
     </div>
     <button className="iconBtn"><Search size={18}/></button>
     <button className="profile">PK</button>
    </div>
   </header>

   <div className="content">
    {page==='dashboard'&&<Dashboard stats={stats} spof={spof} setPage={setPage}/>}
    {page==='graph'&&<GraphPage graph={graph} setGraph={setGraph} load={load} spof={spof} setSpof={setSpof}/>}
    {page==='documents'&&<Documents load={load}/>}
    {page==='emergency'&&<Emergency/>}
   </div>
  </main>
 </div>
}


/* ================= DASHBOARD ================= */

function Dashboard({stats,spof,setPage}){
 return <>
  <PageTitle
   eyebrow="FAMILY CONTINUITY"
   title={<>Protect what matters.<br/><em>Prepare for what comes next.</em></>}
   desc="SAHARA maps your family's critical responsibilities, documents and trusted people so continuity doesn't depend on one person."
  />

  <div className="heroBtns">
   <button className="primary" onClick={()=>setPage('documents')}>
    <UploadCloud size={17}/> Add a document
   </button>
   <button className="secondary" onClick={()=>setPage('graph')}>
    Explore dependency map <ArrowUpRight size={16}/>
   </button>
  </div>

  <div className="stats">
   <Stat icon={Network} label="Connected nodes" value={stats.nodes} trend="Live graph"/>
   <Stat icon={Link2} label="Dependencies" value={stats.links} trend="Mapped links"/>
   <Stat icon={AlertTriangle} label="Risk points" value={stats.risks}
    trend={stats.risks?'Needs attention':'No critical risks'} danger={!!stats.risks}/>
   <Stat icon={FileText} label="Documents" value={stats.docs} trend="In your vault"/>
  </div>

  <div className="grid2">
   <div className="panel riskPanel">
    <div className="panelHead">
     <div><span className="eyebrow">RESILIENCE CHECK</span><h3>Single points of failure</h3></div>
     <div className={'score '+(spof.length?'warn':'good')}>{spof.length?'Attention':'Clear'}</div>
    </div>

    {spof.length?
     spof.slice(0,3).map(x=><div className="riskRow" key={x}>
      <div className="riskIcon"><AlertTriangle size={16}/></div>
      <div><b>{x}</b><span>Critical dependency node</span></div>
      <ChevronRight size={16}/>
     </div>):
     <div className="emptyState">
      <CheckCircle2 size={25}/>
      <div><b>No single points detected</b><span>Your current dependency network has no articulation-point risks.</span></div>
     </div>
    }

    <button className="panelLink" onClick={()=>setPage('graph')}>
     Analyze dependency network <ArrowUpRight size={15}/>
    </button>
   </div>

   <div className="panel readiness">
    <div className="panelHead">
     <div><span className="eyebrow">CONTINUITY READINESS</span><h3>Prepared for the unexpected</h3></div>
     <div className="readinessNum">92<span>%</span></div>
    </div>

    <div className="meter"><span style={{width:'92%'}}/></div>
    <Check text="Core responsibilities mapped"/>
    <Check text="Trusted members configured"/>
    <Check text="Review emergency capsule" pending/>
    <button className="panelLink" onClick={()=>setPage('emergency')}>
     Open emergency capsule <ArrowUpRight size={15}/>
    </button>
   </div>
  </div>
 </>
}

function Check({text,pending}){
 return <div className={'check '+(pending?'pending':'')}>
  {pending?<Clock3 size={17}/>:<CheckCircle2 size={17}/>}
  <span>{text}</span><b>{pending?'Due':'Done'}</b>
 </div>
}

function Stat({icon:Icon,label,value,trend,danger}){
 return <div className="stat">
  <div className="statIcon"><Icon size={18}/></div>
  <div><span>{label}</span><strong>{value||'—'}</strong><small className={danger?'danger':''}>{trend}</small></div>
 </div>
}


/* ================= GRAPH ================= */

function GraphPage({graph,setGraph,load,spof,setSpof}){
 const[loading,setLoading]=useState(false);
 const[owner,setOwner]=useState('');
 const[responsibility,setResponsibility]=useState('');
 const[dependent,setDependent]=useState('');
 const[msg,setMsg]=useState(null);

 const refresh=async()=>{
  setLoading(true);
  try{
   const[g,r]=await Promise.all([
    fetch(API+'/api/v1/graph/visualization'),
    fetch(API+'/api/v1/graph/analyze-risk')
   ]);
   if(g.ok)setGraph(await g.json());
   if(r.ok)setSpof((await r.json()).single_points_of_failure||[]);
  }catch(e){console.error('[GRAPH]',e)}
  setLoading(false);
 };

 useEffect(()=>{refresh()},[]);

 const addDependency=async()=>{
  if(!owner.trim()||!responsibility.trim()||!dependent.trim()){
   setMsg({error:'Please fill all fields.'});return;
  }

  try{
   const r=await fetch(API+'/api/v1/graph/add-dependency',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
     id:`${owner}-${responsibility}-${dependent}`,
     label:responsibility,
     owner,
     dependent,
     type:'asset_or_task'
    })
   });

   const d=await r.json();
   if(!r.ok)throw new Error(d.detail||'Failed to add dependency');

   setMsg({success:'Dependency added successfully.'});
   setOwner('');setResponsibility('');setDependent('');
   await refresh();
   await load();
  }catch(e){
   setMsg({error:e.message});
  }
 };

 const flowNodes=useMemo(()=>(
  graph?.nodes?.map((n,i)=>({
   id:String(n.id),
   type:'sahara',
   data:{label:n.label,type:n.type},
   position:{
    x:n.type==='person'?120:430,
    y:i*180+80
   }
  }))||[]
 ),[graph]);

 const flowEdges=useMemo(()=>(
  graph?.edges?.map(e=>({
   id:String(e.id),
   source:String(e.source),
   target:String(e.target),
   type:'smoothstep',
   animated:true,
   markerEnd:{type:MarkerType.ArrowClosed,width:18,height:18}
  }))||[]
 ),[graph]);

 const[nodes,setNodes,onNodesChange]=useNodesState(flowNodes);
 const[edges,setEdges,onEdgesChange]=useEdgesState(flowEdges);

 useEffect(()=>setNodes(flowNodes),[flowNodes,setNodes]);
 useEffect(()=>setEdges(flowEdges),[flowEdges,setEdges]);

 return <>
  <PageTitle
   eyebrow="DEPENDENCY INTELLIGENCE"
   title="Family dependency map"
   desc="See how people, responsibilities and critical assets connect — and where continuity could break."
   action={<button className="secondary" onClick={refresh} disabled={loading}>
    <RefreshCw size={16} className={loading?'spin':''}/>
    {loading?'Refreshing...':'Refresh analysis'}
   </button>}
  />

  <div className="panel addDependencyPanel">
   <div className="panelHead">
    <div><span className="eyebrow">DEPENDENCY MANAGEMENT</span><h3>Add a dependency</h3></div>
    <Link2 size={20}/>
   </div>

   <div className="dependencyForm">
    <label>Owner
     <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Rohan"/>
    </label>

    <label>Responsibility / Asset
     <input value={responsibility} onChange={e=>setResponsibility(e.target.value)} placeholder="Health Insurance"/>
    </label>

    <label>Dependent
     <input value={dependent} onChange={e=>setDependent(e.target.value)} placeholder="Priya"/>
    </label>

    <button className="primary" onClick={addDependency}>
     <Link2 size={16}/> Add
    </button>
   </div>

   {msg&&<div className={'result '+(msg.error?'error':'success')}>
    {msg.error?<AlertTriangle size={18}/>:<CheckCircle2 size={18}/>}
    <span>{msg.error||msg.success}</span>
   </div>}
  </div>

  <div className="graphLayout">
   <div className="graphCanvas">
    <ReactFlow
     nodes={nodes}
     edges={edges}
     onNodesChange={onNodesChange}
     onEdgesChange={onEdgesChange}
     nodeTypes={{sahara:GraphNode}}
     fitView
    >
     <Background gap={24} size={1}/>
     <Controls/>
     <MiniMap pannable zoomable/>
    </ReactFlow>

    {!loading&&!nodes.length&&<div className="graphEmpty">
     <Network size={32}/>
     <b>No dependencies yet</b>
     <span>Add a responsibility above to build your family map.</span>
    </div>}
   </div>

   <aside className="graphSide">
    <div className="panel">
     <span className="eyebrow">RISK ANALYSIS</span>
     <h3>Network health</h3>
     <div className="bigMetric">{spof.length}<small>risk point{spof.length!==1?'s':''}</small></div>

     {spof.length?
      spof.map(n=><div className="riskRow compact" key={n}>
       <div className="riskIcon"><AlertTriangle size={15}/></div>
       <div><b>{n}</b><span>Single point of failure</span></div>
      </div>):
      <div className="clearBox"><CheckCircle2 size={18}/><span>No articulation-point risks found.</span></div>
     }
    </div>

    <div className="legend panel">
     <span className="eyebrow">LEGEND</span>
     <div><i className="dot person"/> Person</div>
     <div><i className="dot asset"/> Responsibility / Asset</div>
     <div><i className="line"/> Dependency flow</div>
    </div>
   </aside>
  </div>
 </>
}

function GraphNode({data}){
 const person=data.type==='person';
 return <div className={'graphNode '+(person?'person':'asset')}>
  <Handle type="target" position={Position.Left}/>
  <div className="nodeIcon">
   {person?<UserRound size={15}/>:<KeyRound size={15}/>}
  </div>
  <div><b>{data.label}</b><span>{person?'Person':'Responsibility'}</span></div>
  <Handle type="source" position={Position.Right}/>
 </div>
}


/* ================= DOCUMENTS ================= */

function Documents({load}){
 const[file,setFile]=useState(null);
 const[owner,setOwner]=useState('Rohan');
 const[dependent,setDependent]=useState('Priya');
 const[result,setResult]=useState(null);
 const[busy,setBusy]=useState(false);

 const submit=async e=>{
  e.preventDefault();
  if(!file)return;

  setBusy(true);setResult(null);

  try{
   const fd=new FormData();
   fd.append('file',file);
   fd.append('owner',owner);
   fd.append('dependent',dependent);

   const r=await fetch(API+'/api/v1/documents/upload-and-link',{
    method:'POST',body:fd
   });

   const d=await r.json();
   if(!r.ok)throw new Error(d.detail||'Upload failed');

   setResult(d);
   await load();
  }catch(e){
   setResult({error:e.message});
  }finally{
   setBusy(false);
  }
 };

 return <>
  <PageTitle
   eyebrow="DOCUMENT INTELLIGENCE"
   title="Your document vault"
   desc="Upload a policy or important document. SAHARA extracts key details and links it into your family dependency graph."
  />

  <div className="docsGrid">
   <form className="panel uploadCard" onSubmit={submit}>
    <div className="uploadIcon"><ScanText size={23}/></div>
    <h3>Scan & link a document</h3>
    <p className="muted">OCR reads the document and automatically creates a responsibility link.</p>

    <label className={'drop '+(file?'selected':'')}>
     <input type="file" accept="image/*,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files?.[0])}/>
     <UploadCloud size={27}/>
     <b>{file?file.name:'Drop an image here'}</b>
     <span>{file?'Ready to process':'or click to browse · PNG/JPG'}</span>
    </label>

    <div className="formRow">
     <label>Owner
      <input value={owner} onChange={e=>setOwner(e.target.value)}/>
     </label>
     <label>Dependent
      <input value={dependent} onChange={e=>setDependent(e.target.value)}/>
     </label>
    </div>

    <button className="primary full" disabled={!file||busy}>
     {busy?<><RefreshCw className="spin" size={17}/> Processing...</>:<><ScanText size={17}/> Process & link</>}
    </button>

    {result&&<div className={'result '+(result.error?'error':'success')}>
     {result.error?<AlertTriangle size={18}/>:<CheckCircle2 size={18}/>}
     <div>
      <b>{result.error?'Upload failed':'Document linked successfully'}</b>
      {!result.error&&<span>
       {result.graph_link?.owner} → {result.graph_link?.responsibility} → {result.graph_link?.dependent}
      </span>}
      {result.error&&<span>{result.error}</span>}
     </div>
    </div>}
   </form>

   <div className="panel vaultPreview">
    <div className="panelHead">
     <div><span className="eyebrow">VAULT</span><h3>Protected documents</h3></div>
     <span className="count">Encrypted</span>
    </div>

    <Doc title="Health Insurance Policy" sub="Policy · POL-99218"/>
    <Doc title="House Rent Auto-Debit" sub="Financial responsibility"/>

    <div className="secureNote">
     <LockKeyhole size={17}/>
     <div><b>Private by design</b><span>Documents are processed locally by your configured backend.</span></div>
    </div>
   </div>
  </div>
 </>
}

function Doc({title,sub}){
 return <div className="docItem">
  <div className="docIcon"><FileText size={18}/></div>
  <div><b>{title}</b><span>{sub}</span></div>
  <CheckCircle2 size={17}/>
 </div>
}


/* ================= EMERGENCY ================= */

function Emergency(){
 const[ids,setIds]=useState('trustee_a,trustee_b');
 const[busy,setBusy]=useState(false);
 const[res,setRes]=useState(null);

 const trigger=async()=>{
  setBusy(true);
  try{
   const r=await fetch(API+'/api/v1/emergency/trigger',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
     user_id:'user_101',
     trustee_ids:ids.split(',').map(x=>x.trim()).filter(Boolean)
    })
   });
   setRes(await r.json());
  }catch(e){
   setRes({status:'ERROR',detail:e.message});
  }finally{
   setBusy(false);
  }
 };

 return <>
  <PageTitle
   eyebrow="EMERGENCY CONTINUITY"
   title="Emergency capsule"
   desc="A controlled release mechanism for the information your trusted people may need when you cannot manage it yourself."
  />

  <div className="emergencyGrid">
   <div className="capsule panel">
    <div className="capsuleTop">
     <div className="capsuleShield"><Shield size={34}/></div>
     <div><span className="pill dangerPill">CONTROLLED RELEASE</span><h2>Digital continuity capsule</h2></div>
    </div>

    <p>Release is gated by the required number of trusted members. This demo backend requires <b>2 trustees</b>.</p>

    <div className="trustees">
     <Trustee initials="TA" name="Trustee A"/>
     <Trustee initials="TB" name="Trustee B"/>
    </div>

    <label className="wideLabel">Trustee IDs
     <input value={ids} onChange={e=>setIds(e.target.value)} placeholder="trustee_a, trustee_b"/>
    </label>

    <button className="dangerBtn" onClick={trigger} disabled={busy}>
     {busy?<><RefreshCw className="spin"/> Verifying...</>:<><AlertTriangle size={17}/> Simulate emergency trigger</>}
    </button>

    {res&&<div className={'release '+(res.status==='RELEASED'?'released':'pending')}>
     <div className="releaseStatus">
      {res.status==='RELEASED'?<CheckCircle2/>:<Clock3/>}
      <div><b>{res.status?.replaceAll('_',' ')}</b><small>{res.status==='RELEASED'?'Capsule contents are available to the verified trustees.':'More trustee verification is required.'}</small></div>
     </div>
     {res.released_items?.map((x,i)=><div className="releaseItem" key={i}>
      <FileText size={16}/><div><b>{x.title}</b><span>{x.policy_num||x.action||x.due_day}</span></div>
     </div>)}
    </div>}
   </div>

   <aside>
    <div className="panel emergencyInfo">
     <span className="eyebrow">HOW IT WORKS</span>
     <h3>Three layers of protection</h3>
     <Step n="01" title="Trigger" text="An emergency request starts the release workflow."/>
     <Step n="02" title="Verify" text="Trusted members provide the required confirmation."/>
     <Step n="03" title="Release" text="Only approved continuity items become available."/>
    </div>
   </aside>
  </div>
 </>
}

function Trustee({initials,name}){
 return <div className="trustee active">
  <div className="avatar">{initials}</div>
  <div><b>{name}</b><span>Verified member</span></div>
  <CheckCircle2/>
 </div>
}

function Step({n,title,text}){
 return <div className="step">
  <span>{n}</span><div><b>{title}</b><small>{text}</small></div>
 </div>
}


/* ================= PAGE TITLE ================= */

function PageTitle({eyebrow,title,desc,action}){
 return <div className="pageTitle">
  <div>
   <span className="eyebrow">{eyebrow}</span>
   <h1>{title}</h1>
   <p>{desc}</p>
  </div>
  {action}
 </div>
}


createRoot(document.getElementById('root')).render(<App/>);