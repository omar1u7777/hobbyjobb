import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
export default function Navbar() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [open, setOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };
  const ns = ({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--dark)' : 'var(--muted)', fontWeight: 500, fontSize: 15 });
  return <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}><div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--nav-h)' }}><Link to={user ? '/home' : '/'} style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)' }}>hobby<span style={{ color: 'var(--blue)' }}>jobb</span></Link><div style={{ display: 'flex', gap: 28, alignItems: 'center' }}><NavLink to="/jobs" style={ns}>Hitta jobb</NavLink>{user ? <><Link to="/lagg-upp-jobb" className="btn btn-outline" style={{ fontSize: 14, padding: '8px 16px' }}>+ Lägg upp jobb</Link><button onClick={handleLogout} className="btn btn-ghost btn-sm">Logga ut</button></> : <><Link to="/login" style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)' }}>Logga in</Link><Link to="/register" className="btn btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>Kom igång</Link></>}</div></div></nav>;
}
