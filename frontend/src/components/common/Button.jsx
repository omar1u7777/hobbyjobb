// git commit: "feat(common): add reusable Button component with primary/secondary/ghost variants"

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const cls = [
    'btn',
    variant === 'primary'   ? 'btn-primary'  : '',
    variant === 'outline'   ? 'btn-outline'  : '',
    variant === 'ghost'     ? 'btn-ghost'    : '',
    variant === 'danger'    ? 'btn-danger'   : '',
    size === 'sm'           ? 'btn-sm'       : '',
    size === 'lg'           ? 'btn-lg'       : '',
    full                    ? 'btn-full'     : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading ? <Spinner size={16} color="currentColor" /> : null}
      {children}
    </button>
  );
}

// ── Spinner (also used standalone) ──────────────────────────────────────
import Spinner from './Spinner.jsx';
