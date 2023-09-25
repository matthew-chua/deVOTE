import Button from "./Button";

export default function Banner({
  setSelectedCandidate,
  setOpenConfirmationModal,
}: {
  setSelectedCandidate: (candidate: number) => void;
  setOpenConfirmationModal: (open: boolean) => void;
}) {
  const handleBurnVote = () => {
    setOpenConfirmationModal(true);
    setSelectedCandidate(0);
  };
  return (
    <div className="flex items-center w-full max-w-[830px] p-5 font-thin bg-slate-500 rounded-xl m-2">
      <div>
        Not sure who to vote for?{" "}
        <span className="text-red-400 font-bold"> BURN</span> your vote
        anonymously.
      </div>
      <div className="grow" />
      <Button label="Burn Vote" onClick={handleBurnVote} />
    </div>
  );
}
