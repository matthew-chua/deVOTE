import Candidate from "../interfaces/Candidate";
import Profile from "../assets/profile.svg";

export default function Card({
  candidate,
  onClick,
  showResults,
  voteCount,
  winner,
}: {
  candidate: Candidate;
  onClick: () => void;
  showResults: boolean;
  voteCount?: Number;
  winner?: boolean;
}) {

  const regularClass = "flex flex-col items-center bg-slate-500 p-4 text-center rounded-xl w-64 cursor-pointer transition duration-200 hover:scale-110"
  const winnerClass = "flex flex-col items-center bg-red-400 p-4 text-center rounded-xl w-64 scale-110 cursor-pointer transition duration-200 hover:scale-110"
  return (
    <div
      className={winner ? winnerClass : regularClass}
      onClick={onClick}
    >
      <img className="w-32 m-6" src={Profile} />
      <div className="text-2xl">{candidate.name}</div>
      <div className="font-thin m-2">{candidate.description}</div>
      {showResults && (
        <div className="text-2xl mt-4">
          {voteCount ? voteCount.toString() : "0"} votes
        </div>
      )}
    </div>
  );
}
