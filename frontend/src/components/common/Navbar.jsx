// git commit: "feat(navbar): build responsive Navbar with auth state and hamburger menu"

import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotification();
  const navigate         = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // A11y: Stäng mobilmenyn med ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  // UX: Lås body-scroll medan mobilmenyn är öppen
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  const handleLogout = () => {
    closeMenu();
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

              <Link to="/lagg-upp-jobb" className="btn btn-outline nav-action-btn" style={{ fontSize: 14, padding: '8px 16px' }}>
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
                  <div role="menu" style={{
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
                  }}>
                    <DropItem to="/profil" onClick={() => setDropOpen(false)}>👤 Min profil</DropItem>
                    <DropItem to="/mina-jobb" onClick={() => setDropOpen(false)}>📋 Mina jobb</DropItem>
                    {user.is_admin && <DropItem to="/admin" onClick={() => setDropOpen(false)}>⚙️ Admin</DropItem>}
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
              <Link to="/login" className="nav-action-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)' }}>
                Logga in
              </Link>
              <Link to="/lagg-upp-jobb" className="btn btn-outline nav-action-btn" style={{ fontSize: 14, padding: '8px 16px' }}>
                Lägg upp jobb
              </Link>
              <Link to="/register" className="btn btn-primary nav-action-btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
                Kom igång
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
            }}
            aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobil meny-overlay (renderas endast när öppen) */}
      {menuOpen && (
        <>
          {/* Backdrop — stäng vid klick utanför */}
          <div
            onClick={closeMenu}
            aria-hidden="true"
            className="mobile-nav-backdrop"
            style={{
              position: 'fixed',
              inset: 'var(--nav-h) 0 0 0',
              background: 'rgba(15,23,42,0.45)',
              zIndex: 90,
            }}
          />

          {/* Slide-down panel */}
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobilmeny"
            className="mobile-nav-panel"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--white)',
              borderBottom: '1px solid var(--border)',
              boxShadow: 'var(--sh-lg)',
              maxHeight: 'calc(100vh - var(--nav-h))',
              overflowY: 'auto',
              zIndex: 95,
              animation: 'mobileNavIn .18s ease',
            }}
          >
            <div className="container" style={{ padding: '12px 0 18px' }}>
              {/* Primära navigationslänkar (samma som desktop) */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
                <li><MobileLink to="/jobs" onClick={closeMenu}>🔍 Hitta jobb</MobileLink></li>
                <li><MobileLink to="/hobbyinfo" onClick={closeMenu}>ℹ️ Hobbyinfo</MobileLink></li>
                {user && <li><MobileLink to="/mina-jobb" onClick={closeMenu}>📋 Mina jobb</MobileLink></li>}
              </ul>

              {/* Auth-sektion */}
              <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 8, paddingTop: 8 }}>
                {user ? (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
                    <li>
                      <MobileLink to="/chatt" onClick={closeMenu}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          💬 Meddelanden
                          {unreadCount > 0 && (
                            <span style={{
                              background: 'var(--red)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              minWidth: 20,
                              height: 20,
                              padding: '0 6px',
                              borderRadius: 999,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </span>
                      </MobileLink>
                    </li>
                    <li><MobileLink to="/profil" onClick={closeMenu}>👤 Min profil</MobileLink></li>
                    <li><MobileLink to="/lagg-upp-jobb" onClick={closeMenu}>➕ Lägg upp jobb</MobileLink></li>
                    {user.is_admin && <li><MobileLink to="/admin" onClick={closeMenu}>⚙️ Admin</MobileLink></li>}
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 16px',
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'var(--red)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font)',
                          borderRadius: 8,
                        }}
                      >
                        🚪 Logga ut
                      </button>
                    </li>
                  </ul>
                ) : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px' }}>
                    <li>
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="btn btn-ghost btn-full"
                        style={{ fontSize: 15 }}
                      >
                        Logga in
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/lagg-upp-jobb"
                        onClick={closeMenu}
                        className="btn btn-outline btn-full"
                        style={{ fontSize: 15 }}
                      >
                        Lägg upp jobb
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        onClick={closeMenu}
                        className="btn btn-primary btn-full"
                        style={{ fontSize: 15 }}
                      >
                        Kom igång
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media(max-width:900px){
          .nav-links-desktop{display:none!important}
          .hamburger{display:flex!important}
        }
        @media(max-width:768px){
          .nav-action-btn, .nav-action-link, .nav-action-btn-primary {
            display: none !important;
          }
        }
        @media(min-width:901px){
          .mobile-nav-panel,.mobile-nav-backdrop{display:none!important}
        }
        @keyframes mobileNavIn{
          from{opacity:0;transform:translateY(-8px)}
          to{opacity:1;transform:none}
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

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'block',
        padding: '14px 16px',
        fontSize: 16,
        fontWeight: 600,
        color: isActive ? 'var(--blue)' : 'var(--dark)',
        textDecoration: 'none',
        background: isActive ? 'var(--blue-light)' : 'transparent',
        borderRadius: 8,
      })}
    >
      {children}
    </NavLink>
  );
}

function DropItem({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} role="menuitem" style={{
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
