export default function Button({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} className="btn">
      {children}
    </button>
  );
}