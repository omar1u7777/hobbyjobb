export default function Input({ label, hint, error, id, type = 'text', style = {}, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
}
