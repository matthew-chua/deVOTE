import Button from "./Button";

export default function Modal({ onClose }: { onClose: () => void}) {
  return (
    <div className="flex flex-col items-center z-2 bg-red-400 text-white rounded-lg p-8 fixed bottom-1/2 text-xl text-center">
      There was an error processing your vote.
      <br /> You might have already voted.
      <Button className="mt-8 border-2" label="Close" onClick={onClose} />
    </div>
  );
}
