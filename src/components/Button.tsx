import LoadingSpinner from "./LoadingSpinner";
export default function Button({
  label,
  className,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => any;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${className} rounded-md bg-red-400 w-36 h-10 text-white hover:scale-110 transition duration-200`}
      >
        {loading ? <LoadingSpinner/> : label}
      </button>
    </div>
  );
}
