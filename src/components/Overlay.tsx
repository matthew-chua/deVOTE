export default function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="bg-slate-400 opacity-70 h-screen w-screen z-1 fixed"
      onClick={onClick}
    />
  );
}
