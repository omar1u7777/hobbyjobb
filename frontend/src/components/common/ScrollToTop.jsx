import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Återställ scrollpositionen till toppen av sidan vid varje sidbyte
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Använd instant för att undvika "rullnings-effekt" när man byter sida
    });
  }, [pathname]);

  return null;
}
