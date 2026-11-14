import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Activity, ArrowDownUp, ArrowRight, Bell, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, Clock3, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { api } from "./api";
import { useAuth } from "./AuthContext";

function Brand({ compact = false }) {
  return <div className="brand"><span className="brand-mark"><ClipboardCheck size={19} /></span>{!compact && <span>Test<span className="brand-accent">Flow</span></span>}</div>;
}

function AuthLayout({ children, title, subtitle }) {
  return <div className="auth-shell"><div className="auth-left"><Brand /><div className="auth-message"><span className="eyebrow"><Sparkles size={14}/> QA WORKSPACE</span><h1>Make quality<br/>your <em>standard.</em></h1><p>Bring your testing projects together. Stay organized, collaborate clearly, and ship with confidence.</p><div className="auth-proof"><span><ShieldCheck size={16}/> Secure sign in</span><span><Activity size={16}/> One focused workspace</span></div></div><div className="auth-foot">A calmer way to manage quality.</div></div><div className="auth-right"><div className="auth-card"><div className="mobile-brand"><Brand /></div><span className="eyebrow">WELCOME TO TESTFLOW</span><h2>{title}</h2><p className="muted">{subtitle}</p>{children}</div></div></div>;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { session, login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (session) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { if (isRegister) await register(email.trim(), password); else await login(email.trim(), password); navigate("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <AuthLayout title={isRegister ? "Create your account" : "Welcome back"} subtitle={isRegister ? "Start organizing your QA work in one place." : "Sign in to continue to your workspace."}>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>Password<input type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={isRegister ? "new-password" : "current-password"}/></label>
      {error && <div className="alert">{error}</div>}
      <button className="btn btn-primary btn-wide" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"} <ArrowRight size={16}/></button>
    </form>
    <p className="auth-switch">{isRegister ? "Already have an account?" : "New to TestFlow?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
    <p className="fine-print"><ShieldCheck size={13}/> Your account is protected with secure authentication.</p>
  </AuthLayout>;
}

function Protected({ children }) {
  const { session } = useAuth();
  return session ? children : <Navigate to="/login" replace />;
}

function AppShell({ children }) {
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const initials = (session?.email || "T").slice(0,1).toUpperCase();
  return <div className="app-shell">
    <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
      <div className="sidebar-brand"><Brand/><button className="icon-btn mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE <ChevronDown size={13}/></div>
      <div className="workspace-card"><span className="workspace-icon"><FolderKanban size={17}/></span><span><b>My workspace</b><small>Personal account</small></span><span className="online-dot"/></div>
      <div className="nav-label">MENU</div>
      <nav className="side-nav"><div className="nav-item active"><LayoutDashboard size={17}/> Overview</div><div className="nav-item"><FolderKanban size={17}/> Projects <span className="nav-soon">NOW</span></div><div className="nav-item disabled"><ClipboardCheck size={17}/> Test cases <span className="nav-soon">SOON</span></div><div className="nav-item disabled"><Activity size={17}/> Test runs <span className="nav-soon">SOON</span></div><div className="nav-item disabled"><ShieldCheck size={17}/> Defects <span className="nav-soon">SOON</span></div></nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18}/><b>Need a hand?</b><p>Your QA workspace is growing. More tools are on the way.</p></div><button className="profile-row" onClick={()=>{logout();navigate("/login");}}><span className="avatar">{initials}</span><span className="profile-text"><b>{session?.email}</b><small>{session?.role || "Tester"}</small></span><LogOut size={16}/></button></div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={()=>setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="main-area"><header className="topbar"><button className="icon-btn menu-toggle" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><span className="top-status"><span className="online-dot"/> All systems operational</span><button className="icon-btn" title="Notifications"><Bell size={18}/></button><span className="avatar avatar-small">{initials}</span></div></header>{children}</main>
  </div>;
}

function Dashboard() {
  const { session } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", description:"", status:"Active" });
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    setLoading(true); setError("");
    try { setProjects(await api.projects(session.token)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadProjects(); }, []);
  const filtered = useMemo(() => projects.filter(p => (filter === "All" || p.status === filter) && (p.name.toLowerCase().includes(query.toLowerCase()) || (p.description || "").toLowerCase().includes(query.toLowerCase()))), [projects,filter,query]);
  const stats = [{label:"Total projects",value:projects.length,icon:FolderKanban,tone:"violet"},{label:"Active projects",value:projects.filter(p=>p.status==="Active").length,icon:Activity,tone:"green"},{label:"Completed",value:projects.filter(p=>p.status==="Completed").length,icon:CheckCircle2,tone:"blue"}];

  function openCreate() { setEditing(null); setForm({name:"",description:"",status:"Active"}); setModal(true); }
  function openEdit(project) { setEditing(project); setForm({name:project.name,description:project.description || "",status:project.status}); setModal(true); }
  async function saveProject(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) await api.updateProject(editing.id,form,session.token);
      else await api.createProject(form,session.token);
      setModal(false); await loadProjects();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function removeProject(project) {
    if (!window.confirm(`Delete "${project.name}"? This action cannot be undone.`)) return;
    try { await api.deleteProject(project.id,session.token); await loadProjects(); }
    catch(err) { setError(err.message); }
  }
  function dateLabel(value) { return value ? new Date(value).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}) : "—"; }

  return <div className="page-content">
    <div className="welcome-row"><div><span className="eyebrow">SATURDAY, NOVEMBER 14, 2026</span><h1>Good to see you<span className="wave"> ✦</span></h1><p className="muted">Here’s what’s happening across your QA workspace.</p></div><button className="btn btn-primary" onClick={openCreate}><Plus size={17}/> New project</button></div>
    {error && <div className="alert page-alert">{error}</div>}
    <section className="stat-grid">{stats.map(({label,value,icon:Icon,tone})=><div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><strong>{loading ? "—" : value}</strong><small>{label==="Total projects"?"Across your workspace":label==="Active projects"?"Currently in progress":"Successfully finished"}</small></div>)}</section>
    <section className="section-heading"><div><h2>Your projects</h2><p className="muted">Keep track of the work that matters.</p></div><span className="project-count">{projects.length} {projects.length===1?"project":"projects"}</span></section>
    <section className="project-toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search projects..." value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button className="clear-search" onClick={()=>setQuery("")}><X size={14}/></button>}</div><div className="filter-wrap"><ArrowDownUp size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Active</option><option>Completed</option><option>On Hold</option></select></div></section>
    {loading ? <div className="loading-state"><span className="spinner"/>Loading your projects...</div> : filtered.length ? <div className="project-grid">{filtered.map(project=><article className="project-card" key={project.id}><div className="project-card-top"><span className="project-symbol"><FolderKanban size={19}/></span><div className="project-menu"><button className="icon-btn" title="Edit project" onClick={()=>openEdit(project)}><Settings2 size={16}/></button><button className="icon-btn danger-hover" title="Delete project" onClick={()=>removeProject(project)}><Trash2 size={16}/></button></div></div><h3>{project.name}</h3><p>{project.description || "No description added yet."}</p><div className="project-card-bottom"><span className={`status-pill ${project.status.toLowerCase().replace(" ","-")}`}><i/>{project.status}</span><span className="date-label"><Clock3 size={13}/> {dateLabel(project.created_at)}</span></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><FolderKanban size={25}/></div><h3>{query || filter!=="All" ? "No matching projects" : "Your workspace starts here"}</h3><p>{query || filter!=="All" ? "Try changing your search or filter." : "Create your first project and start organizing your QA activities."}</p>{!query && filter==="All" && <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Create your first project</button>}</div>}
    <footer className="page-footer"><span>© 2026 TestFlow · QA Management System</span><span><span className="online-dot"/> Connected to your workspace</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><div className="modal"><div className="modal-heading"><div><span className="eyebrow">{editing?"UPDATE DETAILS":"GET STARTED"}</span><h2>{editing?"Edit project":"Create a project"}</h2></div><button className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div><form onSubmit={saveProject} className="project-form"><label>Project name<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. E-commerce website testing" maxLength={150} required/></label><label>Description <span className="optional">Optional</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What are you testing in this project?" rows={3}/></label><label>Project status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Completed</option><option>On Hold</option></select></label>{error && <div className="alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?"Saving...":editing?"Save changes":"Create project"} <ArrowRight size={15}/></button></div></form></div></div>}
  </div>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/dashboard" element={<Protected><AppShell><Dashboard/></AppShell></Protected>}/>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}