import LoadingSpinner from "./LoadingSpinner";
export default function Button({
  label,
  className,
  disabled,
  onClick,
}: {
  label: string;
  className?: string;
  disabled?: boolean;
  onClick: () => any;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${className} rounded-md bg-red-400 w-36 h-10 text-white hover:scale-110 transition duration-200`}
      >
        {label}
      </button>
    </div>
  );
}
