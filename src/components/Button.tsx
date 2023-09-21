export default function Button({
  label,
  className,
  disabled,
  onClick,
}: {
  label: string;
  className?: string;
  disabled?: boolean;
  onClick: () => Promise<void>;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${className} rounded-md bg-red-400 px-6 py-2 text-white hover:scale-110 transition duration-200`}
      >
        {label}
      </button>
    </div>
  );
}
