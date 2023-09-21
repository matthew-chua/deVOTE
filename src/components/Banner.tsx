import Button from "./Button";

export default function Banner({
  burnVote,
  loading,
}: {
  burnVote: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="flex items-center w-full max-w-[830px] p-5 font-thin bg-slate-500 rounded-xl m-2">
      <div>
        Not sure who to vote for?{" "}
        <span className="text-red-400 font-bold"> BURN</span> your vote
        anonymously.
      </div>
      <div className="grow" />
      <Button label="Burn Vote" onClick={burnVote} loading={loading} />
    </div>
  );
}
