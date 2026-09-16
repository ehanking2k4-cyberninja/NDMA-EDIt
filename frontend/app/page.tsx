'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Box,
  ChevronDown,
  CircleHelp,
  Cloud,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, roles: ['super-admin', 'admin', 'viewer'] },
  { label: 'Applications', icon: Box, roles: ['super-admin', 'admin', 'viewer'] },
  { label: 'Image registry', icon: Database, roles: ['super-admin', 'admin'] },
  { label: 'Storage', icon: Database, roles: ['super-admin', 'admin', 'viewer'] },
  { label: 'Compute', icon: Server, roles: ['super-admin', 'admin', 'viewer'] },
  { label: 'Activity', icon: Activity, roles: ['super-admin', 'admin', 'viewer'] },
  { label: 'IAM & Roles', icon: Users, roles: ['super-admin'] },
] as const

const roleDetails = {
  'super-admin': { label: 'Super admin', email: 'superadmin@ndma.gov', description: 'Full platform control' },
  admin: { label: 'Admin', email: 'admin@ndma.gov', description: 'Operate assigned resources' },
  viewer: { label: 'Viewer', email: 'viewer@ndma.gov', description: 'Read-only visibility' },
} as const

const roleFromEmail = (email: string): keyof typeof roleDetails => {
  const normalized = email.trim().toLowerCase()
  if (normalized.includes('viewer')) return 'viewer'
  if (normalized.includes('admin')) return 'admin'
  return 'super-admin'
}

const nodes = [
  { name: 'ndma-cloud-01', ip: '172.18.59.147', role: 'Control plane · etcd', workloads: 5, version: 'v1.36.4+k3s1', status: 'Ready' },
  { name: 'ndma-cloud-02', ip: '172.18.8.77', role: 'Control plane · etcd', workloads: 4, version: 'v1.36.4+k3s1', status: 'Ready' },
  { name: 'ndma-cloud-03', ip: '172.18.59.166', role: 'Control plane · etcd', workloads: 6, version: 'v1.36.4+k3s1', status: 'Ready' },
]

const apps = [
  { name: 'customer-api', image: 'company/customer-api:v1', status: 'Running', replicas: '3 / 3', endpoint: '172.18.59.147:31633', created: '5 min ago' },
  { name: 'cloud-demo', image: 'nginx:alpine', status: 'Running', replicas: '3 / 3', endpoint: '172.18.8.77:31633', created: '12 min ago' },
  { name: 'storage-service', image: 'minio/minio:latest', status: 'Running', replicas: '3 / 3', endpoint: '172.18.59.166:31633', created: '38 min ago' },
  { name: 'billing-worker', image: 'company/billing:v2.4', status: 'Degraded', replicas: '2 / 3', endpoint: '—', created: '1 hr ago' },
]

const repositories = [
  { name: 'company/customer-api', description: 'Customer API service', tags: 8, pulls: '2.4k', size: '184 MB', updated: '5 min ago' },
  { name: 'company/billing', description: 'Billing and payments worker', tags: 12, pulls: '986', size: '241 MB', updated: '1 hr ago' },
  { name: 'platform/edge-proxy', description: 'Private cloud ingress proxy', tags: 5, pulls: '648', size: '92 MB', updated: 'Yesterday' },
  { name: 'platform/worker-base', description: 'Standard runtime base image', tags: 4, pulls: '4.8k', size: '312 MB', updated: '2 days ago' },
]

const activities = [
  ['10:32', 'Application scaled', 'customer-api', 'Success'],
  ['10:25', 'Node recovered', 'ndma-cloud-01', 'Success'],
  ['10:20', 'Node unavailable', 'ndma-cloud-01', 'Warning'],
  ['10:05', 'Bucket created', 'project-files', 'Success'],
]

function StatusPill({ status }: { status: string }) {
  const tone = status === 'Running' || status === 'Ready' || status === 'Success' ? 'success' : status === 'Degraded' || status === 'Warning' ? 'warning' : 'neutral'
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{status}</span>
}

function MetricCard({ icon: Icon, label, value, detail, accent }: { icon: typeof Cloud; label: string; value: string; detail: string; accent?: string }) {
  return <div className="metric-card">
    <div className="metric-top"><span className="metric-icon"><Icon size={16} /></span><span className="metric-label">{label}</span><ArrowUpRight size={14} className="metric-arrow" /></div>
    <div className={`metric-value ${accent || ''}`}>{value}</div>
    <div className="metric-detail">{detail}</div>
  </div>
}

export default function Page() {
  const [active, setActive] = useState('Dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [refreshed, setRefreshed] = useState(false)
  const [query, setQuery] = useState('')
  const [registryQuery, setRegistryQuery] = useState('')
  const [showDeploy, setShowDeploy] = useState(false)
  const [replicas, setReplicas] = useState(3)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [role, setRole] = useState<'super-admin' | 'admin' | 'viewer'>('super-admin')

  const filteredApps = useMemo(() => apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase())), [query])
  const filteredRepositories = useMemo(() => repositories.filter((repo) => repo.name.toLowerCase().includes(registryQuery.toLowerCase())), [registryQuery])

  function refresh() {
    setRefreshed(true)
    window.setTimeout(() => setRefreshed(false), 1400)
  }

  function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!loginEmail && !loginPassword) {
      // Default to super-admin if submitted directly for smooth evaluation
      setRole('super-admin')
      setAuthenticated(true)
      return
    }
    if (!loginEmail || !loginPassword) {
      setLoginError('Enter your email and password to continue.')
      return
    }
    setLoginError('')
    setRole(roleFromEmail(loginEmail))
    setAuthenticated(true)
  }

  function handleQuickLogin(targetRole: 'super-admin' | 'admin' | 'viewer') {
    setRole(targetRole)
    setLoginEmail(roleDetails[targetRole].email)
    setLoginPassword('••••••••')
    setAuthenticated(true)
  }

  if (!authenticated) return <main className="cloud-login-viewport">
    {/* Top Left Branding (Replacing Ebolt) */}
    <header className="brand-header-topleft">
      <img src="/ndmalogo.png" alt="NDMA Logo" className="brand-logo-img" />
      <span className="brand-title-text">
        National Disaster Management Authority
      </span>
    </header>

    {/* Concentric Ripple Rings radiating behind card */}
    <div className="cloud-ripple-rings" aria-hidden="true">
      <div className="ripple-circle ripple-1" />
      <div className="ripple-circle ripple-2" />
      <div className="ripple-circle ripple-3" />
      <div className="ripple-circle ripple-4" />
      <div className="ripple-circle ripple-5" />
    </div>

    {/* Ambient Glow Reflection */}
    <div className="card-ambient-glow" aria-hidden="true" />

    {/* Centered Glassmorphic Login Card */}
    <div className="cloud-auth-card">
      {/* Top Badge Icon matching reference */}
      <div className="card-icon-badge" aria-hidden="true">
        <img src="/ndmalogo.png" alt="NDMA Logo" className="brand-logo-img" />
      </div>
      <p className="cloud-auth-subtitle">
        NDMA's Cloud Platform
      </p>

      <form className="cloud-auth-form" onSubmit={signIn}>
        {/* Email input */}
        <div className="input-field-wrap">
          <span className="input-icon-left">
            <Mail size={17} />
          </span>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            className="cloud-text-input"
          />
        </div>

        {/* Password input */}
        <div className="input-field-wrap">
          <span className="input-icon-left">
            <Lock size={17} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="cloud-text-input has-toggle"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="input-icon-right-btn"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {/* Forgot password row */}
        <div className="forgot-password-row">
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault()
              alert('Password reset instructions sent to registered administrator email.')
            }}
            className="forgot-password-link"
          >
            Forgot password?
          </a>
        </div>

        {loginError && <p className="cloud-auth-error">{loginError}</p>}

        {/* Get Started Button */}
        <button type="submit" className="get-started-btn">
          Sign In
        </button>
      </form>
    </div>
  </main>

  return <div className="console-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><img src="/ndmalogo.png" alt="NDMA logo" /></div><div><div className="brand-name">NDMA <span>PRIVATE CLOUD</span></div><div className="brand-subtitle">On-Prem Infrastructure Platform</div></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="environment"><span className="live-dot" />PRIVATE CLOUD <b>LAB</b><ChevronDown size={13} /></div>
      <div className="nav-section-label">Workspace</div>
      <nav className="nav-list" aria-label="Primary navigation">{navItems.filter((item) => item.roles.includes(role)).map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setMobileNav(false) }} className={`nav-item ${active === label ? 'active' : ''}`}><Icon size={17} /><span>{label}</span>{label === 'Applications' && <span className="nav-count">4</span>}{label === 'Image registry' && <span className="nav-count">4</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><ShieldCheck size={17} /></div><div><strong>Private by design</strong><span>Control plane is on-prem</span></div></div><button className="nav-item"><Settings2 size={17} /><span>Settings</span></button><div className="user-row"><div className="avatar">{roleDetails[role].label.slice(0, 2).toUpperCase()}</div><div><strong>{roleDetails[role].label}</strong><span>{roleDetails[role].description}</span></div><button className="icon-button" onClick={() => setAuthenticated(false)} title="Sign out to Login" aria-label="Sign out" style={{ marginLeft: 'auto' }}><LogOut size={16} /></button></div></div>
    </aside>
    {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div><div className="eyebrow">PRIVATE CLOUD / LAB</div><h1>{active}</h1></div></div><div className="topbar-actions"><div className="cluster-health"><span className="status-dot" /> <span>Cluster</span> <strong>Healthy</strong></div><button className="refresh-button" onClick={refresh}><RefreshCw size={15} className={refreshed ? 'spin' : ''} />{refreshed ? 'Updated' : 'Refresh'}</button><div className="top-avatar">AM</div></div></header>
      <div className="content-wrap">
        {active === 'Dashboard' && <>
          <div className="welcome-row"><div><h2>Good morning, {roleDetails[role].label}.</h2><p>Here&apos;s the latest overview of the resources available to your role.</p></div>{role !== 'viewer' && <button className="primary-button" onClick={() => setShowDeploy(true)}><Plus size={16} />Deploy application</button>}</div>
          <div className="alert-banner"><div className="alert-icon"><AlertTriangle size={17} /></div><div><strong>Cluster degraded</strong><span>1 of 3 nodes briefly unavailable. Applications remain healthy across the cluster.</span></div><button onClick={() => setActive('Compute')}>View nodes <ArrowUpRight size={14} /></button></div>
          <section className="metrics-grid"><MetricCard icon={ShieldCheck} label="Cluster health" value="Healthy" detail="All systems operational" accent="green" /><MetricCard icon={Server} label="Compute" value="3 / 3" detail="Ready and connected" /><MetricCard icon={Box} label="Applications" value="4" detail="Running workloads" /><MetricCard icon={Zap} label="Workloads" value="9 / 9" detail="Healthy instances" /><MetricCard icon={Database} label="Storage buckets" value="5" detail="142 objects" /></section>
          <div className="section-heading"><div><h3>Infrastructure overview</h3><p>Control plane nodes and workload distribution</p></div><button className="text-button" onClick={() => setActive('Compute')}>View all nodes <ArrowUpRight size={14} /></button></div>
          <section className="node-grid">{nodes.map((node) => <div className="node-card" key={node.name}><div className="node-card-top"><div className="node-symbol"><Server size={17} /></div><StatusPill status={node.status} /></div><h4>{node.name}</h4><code>{node.ip}</code><div className="node-role">{node.role}</div><div className="node-card-footer"><span><Box size={13} />{node.workloads} workloads</span><span>{node.version}</span></div></div>)}</section>
          <div className="dashboard-columns"><section className="panel applications-panel"><div className="panel-heading"><div><h3>Running applications</h3><p>Recently deployed workloads</p></div><button className="icon-button" aria-label="More application actions"><MoreHorizontal size={18} /></button></div><div className="table-wrap"><table><thead><tr><th>Application</th><th>Status</th><th>Replicas</th><th>Endpoint</th><th>Created</th></tr></thead><tbody>{apps.slice(0, 4).map((app) => <tr key={app.name}><td><div className="app-name"><span className="app-square"><Box size={13} /></span><div><strong>{app.name}</strong><small>{app.image}</small></div></div></td><td><StatusPill status={app.status} /></td><td className="mono">{app.replicas}</td><td>{app.endpoint !== '—' ? <button className="link-button">Open <ExternalLink size={12} /></button> : '—'}</td><td className="muted">{app.created}</td></tr>)}</tbody></table></div></section><section className="panel activity-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Latest platform events</p></div><button className="text-button" onClick={() => setActive('Activity')}>View all</button></div><div className="activity-list">{activities.map(([time, event, resource, status]) => <div className="activity-row" key={`${time}-${event}`}><span className="activity-time">{time}</span><span className={`activity-marker ${status.toLowerCase()}`} /><div><strong>{event}</strong><span>{resource}</span></div></div>)}</div></section></div>
        </>}
        {active === 'Applications' && <section><div className="welcome-row"><div><h2>Applications</h2><p>Deploy and manage containerized workloads across your private cloud.</p></div><button className="primary-button" onClick={() => setShowDeploy(true)}><Plus size={16} />Deploy application</button></div><div className="toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applications" /></div><button className="secondary-button"><SlidersHorizontal size={15} />All statuses <ChevronDown size={14} /></button><button className="secondary-button" onClick={refresh}><RefreshCw size={15} />Refresh</button></div><section className="panel full-panel"><div className="table-wrap"><table><thead><tr><th>Application</th><th>Status</th><th>Replicas</th><th>Endpoint</th><th>Created</th><th /></tr></thead><tbody>{filteredApps.map((app) => <tr key={app.name}><td><div className="app-name"><span className="app-square"><Box size={13} /></span><div><strong>{app.name}</strong><small>{app.image}</small></div></div></td><td><StatusPill status={app.status} /></td><td className="mono">{app.replicas}</td><td><button className="link-button">Open <ExternalLink size={12} /></button></td><td className="muted">{app.created}</td><td><button className="icon-button"><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></section></section>}
        {active === 'Image registry' && <section><div className="welcome-row"><div><div className="eyebrow">PRIVATE CONTAINER REGISTRY</div><h2>Image registry</h2><p>Store, version, and securely pull Docker images for your applications.</p></div><button className="primary-button"><Upload size={15} />Push image</button></div><div className="registry-summary"><MetricCard icon={Box} label="Repositories" value="4" detail="Private image stores" /><MetricCard icon={Database} label="Registry storage" value="829 MB" detail="Of 10 GB capacity" /><MetricCard icon={ShieldCheck} label="Access" value="Private" detail="IAM protected" accent="green" /></div><div className="toolbar"><div className="search-field"><Search size={16} /><input value={registryQuery} onChange={(e) => setRegistryQuery(e.target.value)} placeholder="Search repositories" /></div><button className="secondary-button"><ShieldCheck size={15} />Private registry</button></div><section className="panel full-panel"><div className="panel-heading"><div><h3>Repositories</h3><p>Images available to your team</p></div><span className="muted">{filteredRepositories.length} repositories</span></div><div className="repository-list">{filteredRepositories.map((repo) => <div className="repository-row" key={repo.name}><div className="repo-icon"><Box size={18} /></div><div className="repo-main"><strong>{repo.name}</strong><span>{repo.description}</span><code>docker pull registry.ndma.gov/{repo.name}:latest</code></div><div className="repo-stat"><strong>{repo.tags}</strong><span>tags</span></div><div className="repo-stat"><strong>{repo.pulls}</strong><span>pulls</span></div><div className="repo-stat"><strong>{repo.size}</strong><span>storage</span></div><span className="muted">{repo.updated}</span><button className="icon-button" aria-label={`Actions for ${repo.name}`}><MoreHorizontal size={17} /></button></div>)}</div></section></section>}
        {active === 'Storage' && <section><div className="welcome-row"><div><h2>Object storage</h2><p>Durable S3-compatible storage for applications and teams.</p></div><button className="primary-button" onClick={() => setShowDeploy(true)}><Plus size={16} />Create bucket</button></div><div className="storage-summary"><MetricCard icon={Database} label="Buckets" value="5" detail="Available containers" /><MetricCard icon={FileText} label="Objects" value="142" detail="Across all buckets" /><MetricCard icon={ShieldCheck} label="Storage backend" value="Available" detail="S3-compatible MinIO" accent="green" /></div><section className="panel full-panel"><div className="panel-heading"><div><h3>Buckets</h3><p>Manage your object storage containers</p></div></div><div className="bucket-list">{['project-files', 'customer-uploads', 'backups', 'media-assets', 'audit-logs'].map((bucket, i) => <div className="bucket-row" key={bucket}><div className="bucket-icon"><Database size={16} /></div><div><strong>{bucket}</strong><span>{[24, 68, 12, 31, 7][i]} objects</span></div><span className="muted">{i === 0 ? 'Today' : `${i + 1} days ago`}</span><button className="text-button">Open <ArrowUpRight size={14} /></button></div>)}</div></section></section>}
        {active === 'Compute' && <section><div className="welcome-row"><div><h2>Compute</h2><p>Compute hosts powering applications across the private cloud.</p></div><button className="secondary-button" onClick={refresh}><RefreshCw size={15} />Refresh</button></div><section className="node-detail-grid">{nodes.map((node) => <div className="panel node-detail" key={node.name}><div className="panel-heading"><div className="node-title"><div className="node-symbol"><Server size={17} /></div><div><h3>{node.name}</h3><p>{node.ip}</p></div></div><StatusPill status={node.status} /></div><div className="detail-grid"><div><span>Role</span><strong>{node.role}</strong></div><div><span>Version</span><strong>{node.version}</strong></div><div><span>Operating system</span><strong>Ubuntu 22.04</strong></div><div><span>Workloads</span><strong>{node.workloads} running</strong></div></div><div className="node-capacity"><span>Workload capacity</span><div className="capacity-bar"><i style={{ width: `${node.workloads * 11 + 18}%` }} /></div><b>{node.workloads} / 12</b></div></div>)}</section></section>}
        {active === 'Activity' && <section><div className="welcome-row"><div><h2>Activity</h2><p>A chronological record of changes across your environment.</p></div><button className="secondary-button" onClick={refresh}><RefreshCw size={15} />Refresh</button></div><section className="panel full-panel"><div className="table-wrap"><table><thead><tr><th>Time</th><th>Event</th><th>Resource</th><th>Status</th></tr></thead><tbody>{activities.concat([['09:48', 'Application deployed', 'billing-worker', 'Success']]).map(([time, event, resource, status]) => <tr key={`${time}-${resource}`}><td className="mono muted">Today, {time}</td><td><strong>{event}</strong></td><td>{resource}</td><td><StatusPill status={status} /></td></tr>)}</tbody></table></div></section></section>}
        {active === 'IAM & Roles' && <section><div className="welcome-row"><div><div className="eyebrow">IDENTITY & ACCESS MANAGEMENT</div><h2>Roles & access</h2><p>Control who can view, operate, and administer your private cloud.</p></div><button className="primary-button" disabled={role !== 'super-admin'}><Plus size={16} />Invite member</button></div><div className="iam-banner"><div className="support-icon"><ShieldCheck size={19} /></div><div><strong>{roleDetails[role].label} access</strong><span>{roleDetails[role].description}. Your navigation and actions are scoped to this role.</span></div><span className="role-chip">{roleDetails[role].label.toUpperCase()}</span></div><div className="role-grid">{[['super-admin', 'Super admin', 'Full platform control', 'Create and manage admins, billing, security, and infrastructure.'], ['admin', 'Admin', 'Operational access', 'Deploy applications and manage assigned infrastructure resources.'], ['viewer', 'Viewer', 'Read-only access', 'View dashboards, applications, nodes, and activity without making changes.']].map(([key, title, level, description]) => <button className={`role-card ${role === key ? 'selected' : ''}`} key={key} onClick={() => setRole(key as 'super-admin' | 'admin' | 'viewer')}><div className="role-card-top"><span className="role-icon"><Users size={16} /></span>{role === key && <span className="status-pill success"><span className="status-dot" />Active</span>}</div><h3>{title}</h3><strong>{level}</strong><p>{description}</p><span className="role-link">View permissions <ArrowUpRight size={13} /></span></button>)}</div><section className="panel full-panel"><div className="panel-heading"><div><h3>Members</h3><p>People with access to this environment</p></div><span className="muted">3 members</span></div><div className="member-list"><div className="member-row"><div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>alex.morgan@ndma.gov</span></div><span className="role-chip">SUPER ADMIN</span><button className="icon-button" aria-label="More member actions"><MoreHorizontal size={17} /></button></div><div className="member-row"><div className="avatar muted-avatar">SK</div><div><strong>Sarah Khan</strong><span>sarah.khan@ndma.gov</span></div><span className="role-chip secondary-chip">ADMIN</span><button className="icon-button" aria-label="More member actions"><MoreHorizontal size={17} /></button></div><div className="member-row"><div className="avatar muted-avatar">HA</div><div><strong>Hassan Ali</strong><span>hassan.ali@ndma.gov</span></div><span className="role-chip secondary-chip">VIEWER</span><button className="icon-button" aria-label="More member actions"><MoreHorizontal size={17} /></button></div></div></section></section>}
      </div>
    </main>
    {showDeploy && <div className="modal-backdrop" role="presentation" onClick={() => setShowDeploy(false)}><div className="deploy-modal" role="dialog" aria-modal="true" aria-labelledby="deploy-title" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">NEW WORKLOAD</div><h2 id="deploy-title">Deploy application</h2></div><button className="icon-button" onClick={() => setShowDeploy(false)} aria-label="Close dialog"><X size={18} /></button></div><div className="form-stack"><label>Application name<input defaultValue="customer-api" /></label><label>Container image<input defaultValue="company/customer-api:v1" /></label><div className="form-row"><label>Instances<div className="stepper"><button onClick={() => setReplicas(Math.max(1, replicas - 1))}>−</button><b>{replicas}</b><button onClick={() => setReplicas(Math.min(20, replicas + 1))}>+</button></div></label><label>Container port<input defaultValue="80" /></label></div><label className="toggle-label"><span><strong>Expose application</strong><small>Automatically expose through available cluster nodes.</small></span><input type="checkbox" defaultChecked /></label></div><div className="modal-footer"><button className="secondary-button" onClick={() => setShowDeploy(false)}>Cancel</button><button className="primary-button" onClick={() => setShowDeploy(false)}><Zap size={15} />Deploy application</button></div></div></div>}
  </div>
}

void [Copy, CircleHelp, Network, Sparkles, Upload, Users]

