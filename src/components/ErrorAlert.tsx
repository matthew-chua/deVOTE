import Button from "./Button";

export default function ErrorAlert({
  setError,
}: {
  setError: (success: boolean) => void;
}) {
  const onClose = () => {
    setError(false);
  };
  return (
    <div className="z-2 flex flex-col items-center justify-center bg-red-400 text-white rounded-lg p-8 fixed bottom-1/2 text-xl text-center h-1/3 w-1/3">
      <div>
        <div className="text-4xl">Error</div>
        <br />
        Something went wrong during voting.
        <br />
        Please check if you are using the right wallet.
      </div>
      <Button
        className="bg-slate-500 mt-12"
        label="Try Again"
        onClick={onClose}
      />
    </div>
  );
}
