import Button from "./Button";

export default function Banner() {
  return (
    <div className="flex items-center w-full max-w-screen-xl p-5 font-thin bg-slate-500 rounded-lg m-2">
      <div>Not sure who to vote for? <span className="text-red-400 font-bold"> BURN</span> your vote anonymously.</div>
      <div className="grow"/>
      <Button label="Burn Vote" onClick={async () => {}} />
    </div>
  );
}
