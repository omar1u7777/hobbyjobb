// git commit: "feat(navbar): build responsive Navbar with auth state and hamburger menu"

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotification();
  const navigate         = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--nav-h)',
      }}>
        {/* Logo */}
        <Link to={user ? '/home' : '/'} style={{
          fontSize: 20,
          fontWeight: 800,
          color: 'var(--dark)',
          textDecoration: 'none',
        }}>
          hobby<span style={{ color: 'var(--blue)' }}>jobb</span>
        </Link>

        {/* Desktop nav links */}
        <ul style={{
          display: 'flex',
          gap: 28,
          listStyle: 'none',
          alignItems: 'center',
        }} className="nav-links-desktop">
          <li><NavLink to="/jobs" style={navStyle}>Hitta jobb</NavLink></li>
          <li><NavLink to="/hobbyinfo" style={navStyle}>Hobbyinfo</NavLink></li>
          {user && <li><NavLink to="/mina-jobb" style={navStyle}>Mina jobb</NavLink></li>}
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* Chat icon with badge */}
              <Link to="/chatt" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                <span style={{ fontSize: 20 }}>💬</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/lagg-upp-jobb" className="btn btn-outline" style={{ fontSize: 14, padding: '8px 16px' }}>
                + Lägg upp jobb
              </Link>

              {/* Avatar dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--blue),#60A5FA)',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </button>

                {dropOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: 'var(--sh-lg)',
                    minWidth: 180,
                    overflow: 'hidden',
                    zIndex: 200,
                  }} onClick={() => setDropOpen(false)}>
                    <DropItem to="/profil">👤 Min profil</DropItem>
                    <DropItem to="/mina-jobb">📋 Mina jobb</DropItem>
                    {(user.is_admin === true || user.is_admin === 1 || user.is_admin === '1' || user.is_admin === 'true') && <DropItem to="/admin">⚙️ Admin</DropItem>}
                    <div style={{ borderTop: '1px solid var(--border-light)' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: 14,
                        color: 'var(--red)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font)',
                      }}>
                        🚪 Logga ut
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)' }}>
                Logga in
              </Link>
              <Link to="/lagg-upp-jobb" className="btn btn-outline" style={{ fontSize: 14, padding: '8px 16px' }}>
                Lägg upp jobb
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
                Kom igång
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
            }}
            aria-label="Meny"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .nav-links-desktop{display:none!important}
          .hamburger{display:flex!important}
        }
      `}</style>
    </nav>
  );
}

function navStyle({ isActive }) {
  return {
    textDecoration: 'none',
    color: isActive ? 'var(--dark)' : 'var(--muted)',
    fontWeight: 500,
    fontSize: 15,
    transition: 'color .15s',
  };
}

function DropItem({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'block',
      padding: '10px 16px',
      fontSize: 14,
      color: 'var(--dark)',
      textDecoration: 'none',
      transition: 'background .12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--border-light)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </Link>
  );
}
