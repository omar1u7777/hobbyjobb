// git commit: "feat(common): add Badge component for category and status labels"

export default function Badge({ children, variant = 'blue', style = {} }) {
  return (
    <span className={`badge badge-${variant}`} style={style}>
      {children}
    </span>
  );
}
