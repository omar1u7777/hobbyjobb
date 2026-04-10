export default function Input({ label, hint, error, id, type = 'text', style = {}, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return <div className="form-group" style={style}>{label && <label htmlFor={inputId}>{label}</label>}<input id={inputId} type={type} {...props} />{hint && !error && <p className="hint">{hint}</p>}{error && <p className="error">{error}</p>}</div>;
}
