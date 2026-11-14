import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Activity, ArrowDownUp, ArrowRight, Bell, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, Clock3, FolderKanban, LayoutDashboard, ListChecks, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
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
      <nav className="side-nav"><Link to="/dashboard" className="nav-item"><LayoutDashboard size={17}/> Overview</Link><Link to="/dashboard" className="nav-item"><FolderKanban size={17}/> Projects</Link><div className="nav-item active"><ListChecks size={17}/> Test cases</div><div className="nav-item disabled"><Activity size={17}/> Test runs <span className="nav-soon">SOON</span></div><div className="nav-item disabled"><ShieldCheck size={17}/> Defects <span className="nav-soon">SOON</span></div></nav>
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
    {loading ? <div className="loading-state"><span className="spinner"/>Loading your projects...</div> : filtered.length ? <div className="project-grid">{filtered.map(project=><article className="project-card" key={project.id}><div className="project-card-top"><span className="project-symbol"><FolderKanban size={19}/></span><div className="project-menu"><button className="icon-btn" title="Edit project" onClick={()=>openEdit(project)}><Settings2 size={16}/></button><button className="icon-btn danger-hover" title="Delete project" onClick={()=>removeProject(project)}><Trash2 size={16}/></button></div></div><h3>{project.name}</h3><p>{project.description || "No description added yet."}</p><Link className="test-case-link" to={`/projects/${project.id}/test-cases`}><ListChecks size={14}/> Manage test cases <ArrowRight size={13}/></Link><div className="project-card-bottom"><span className={`status-pill ${project.status.toLowerCase().replace(" ","-")}`}><i/>{project.status}</span><span className="date-label"><Clock3 size={13}/> {dateLabel(project.created_at)}</span></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><FolderKanban size={25}/></div><h3>{query || filter!=="All" ? "No matching projects" : "Your workspace starts here"}</h3><p>{query || filter!=="All" ? "Try changing your search or filter." : "Create your first project and start organizing your QA activities."}</p>{!query && filter==="All" && <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Create your first project</button>}</div>}
    <footer className="page-footer"><span>© 2026 TestFlow · QA Management System</span><span><span className="online-dot"/> Connected to your workspace</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><div className="modal"><div className="modal-heading"><div><span className="eyebrow">{editing?"UPDATE DETAILS":"GET STARTED"}</span><h2>{editing?"Edit project":"Create a project"}</h2></div><button className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div><form onSubmit={saveProject} className="project-form"><label>Project name<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. E-commerce website testing" maxLength={150} required/></label><label>Description <span className="optional">Optional</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What are you testing in this project?" rows={3}/></label><label>Project status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Completed</option><option>On Hold</option></select></label>{error && <div className="alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?"Saving...":editing?"Save changes":"Create project"} <ArrowRight size={15}/></button></div></form></div></div>}
  </div>;
}


function TestCasesPage() {
  const { projectId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title:"", description:"", preconditions:"", steps:"", expected_result:"", priority:"Medium", status:"Draft" };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true); setError("");
    try {
      const [projectRows, testCases] = await Promise.all([
        api.projects(session.token),
        api.testCases(projectId, session.token),
      ]);
      const selected = projectRows.find(item => String(item.id) === String(projectId));
      if (!selected) throw new Error("Project not found or you do not have access to it.");
      setProject(selected); setCases(testCases);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [projectId]);
  const filtered = useMemo(() => cases.filter(item =>
    (priorityFilter === "All" || item.priority === priorityFilter) &&
    [item.title,item.description,item.steps].some(value => (value || "").toLowerCase().includes(query.toLowerCase()))
  ), [cases,query,priorityFilter]);

  function openCreate() { setEditing(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) { setEditing(item); setForm({ title:item.title, description:item.description || "", preconditions:item.preconditions || "", steps:item.steps, expected_result:item.expected_result, priority:item.priority, status:item.status }); setModal(true); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) await api.updateTestCase(editing.id,form,session.token);
      else await api.createTestCase(projectId,form,session.token);
      setModal(false); await load();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete test case "${item.title}"?`)) return;
    try { await api.deleteTestCase(item.id,session.token); await load(); }
    catch(err) { setError(err.message); }
  }

  return <div className="page-content">
    <div className="welcome-row"><div><button className="back-link" onClick={()=>navigate("/dashboard")}>← Back to projects</button><span className="eyebrow">TEST CASE MANAGEMENT</span><h1>{project?.name || "Project test cases"}</h1><p className="muted">Create and organize test scenarios for this project.</p></div><button className="btn btn-primary" onClick={openCreate} disabled={!project}><Plus size={17}/> New test case</button></div>
    {error && <div className="alert page-alert">{error}</div>}
    <section className="stat-grid test-case-stats">
      <div className="stat-card"><div className="stat-top">Total test cases <span className="stat-icon violet"><ListChecks size={18}/></span></div><strong>{loading?"—":cases.length}</strong><small>Scenarios in this project</small></div>
      <div className="stat-card"><div className="stat-top">Ready <span className="stat-icon green"><CheckCircle2 size={18}/></span></div><strong>{loading?"—":cases.filter(item=>item.status==="Ready").length}</strong><small>Prepared for execution</small></div>
      <div className="stat-card"><div className="stat-top">Draft <span className="stat-icon blue"><ClipboardCheck size={18}/></span></div><strong>{loading?"—":cases.filter(item=>item.status==="Draft").length}</strong><small>Still being prepared</small></div>
    </section>
    <section className="section-heading"><div><h2>Test cases</h2><p className="muted">Document expected behavior before execution.</p></div><span className="project-count">{cases.length} total</span></section>
    <section className="project-toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search test cases..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-wrap"><ArrowDownUp size={15}/><select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div></section>
    {loading ? <div className="loading-state"><span className="spinner"/>Loading test cases...</div> : filtered.length ? <div className="test-case-list">{filtered.map(item=><article className="test-case-card" key={item.id}><div className="test-case-main"><div className="test-case-id">TC-{String(item.id).padStart(3,"0")}</div><div className="test-case-copy"><h3>{item.title}</h3><p>{item.description || "No description added."}</p><div className="test-case-meta"><span className={`priority-pill ${item.priority.toLowerCase()}`}>{item.priority} priority</span><span className={`status-pill ${item.status.toLowerCase()}`}><i/>{item.status}</span></div></div></div><div className="test-case-actions"><button className="icon-btn" title="Edit test case" onClick={()=>openEdit(item)}><Settings2 size={16}/></button><button className="icon-btn danger-hover" title="Delete test case" onClick={()=>remove(item)}><Trash2 size={16}/></button></div><details className="test-case-details"><summary>View test steps and expected result</summary><div className="test-case-detail-grid"><div><b>Preconditions</b><p>{item.preconditions || "None specified."}</p></div><div><b>Test steps</b><p>{item.steps}</p></div><div><b>Expected result</b><p>{item.expected_result}</p></div></div></details></article>)}</div> : <div className="empty-state"><div className="empty-icon"><ListChecks size={25}/></div><h3>{query || priorityFilter!=="All" ? "No matching test cases" : "No test cases yet"}</h3><p>{query || priorityFilter!=="All" ? "Try a different search or priority." : "Add your first test case to document what should be tested."}</p>{!query && priorityFilter==="All" && <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Create first test case</button>}</div>}
    <footer className="page-footer"><span>© 2026 TestFlow · QA Management System</span><span><span className="online-dot"/> Connected to your workspace</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><div className="modal test-case-modal"><div className="modal-heading"><div><span className="eyebrow">{editing?"UPDATE TEST CASE":"NEW TEST CASE"}</span><h2>{editing?"Edit test case":"Create test case"}</h2></div><button className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div><form onSubmit={save} className="project-form"><label>Test case title<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Verify login with valid credentials" maxLength={200} required/></label><label>Description <span className="optional">Optional</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Briefly describe what this test verifies." rows={2}/></label><label>Preconditions <span className="optional">Optional</span><textarea value={form.preconditions} onChange={e=>setForm({...form,preconditions:e.target.value})} placeholder="e.g. User has an active account." rows={2}/></label><label>Test steps<textarea value={form.steps} onChange={e=>setForm({...form,steps:e.target.value})} placeholder={"1. Open the login page.\n2. Enter valid credentials.\n3. Click Login."} rows={4} required/></label><label>Expected result<textarea value={form.expected_result} onChange={e=>setForm({...form,expected_result:e.target.value})} placeholder="The user should be redirected to the dashboard." rows={3} required/></label><div className="form-two-col"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Draft</option><option>Ready</option></select></label></div>{error && <div className="alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?"Saving...":editing?"Save changes":"Create test case"} <ArrowRight size={15}/></button></div></form></div></div>}
  </div>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/dashboard" element={<Protected><AppShell><Dashboard/></AppShell></Protected>}/>
    <Route path="/projects/:projectId/test-cases" element={<Protected><AppShell><TestCasesPage/></AppShell></Protected>}/>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}