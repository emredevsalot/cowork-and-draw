export default function Button({
  theme = "dark",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  theme?: "dark" | "light";
}) {
  const colors =
    theme == "dark" ? "bg-black text-white" : "bg-white text-black";

  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg shadow shadow-gray-400 hover:scale-105 disabled:hover:scale-100 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed transition-transform  ${colors} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
