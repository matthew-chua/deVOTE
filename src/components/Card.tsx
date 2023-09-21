import Candidate from "../interfaces/Candidate";
import Profile from "../assets/profile.svg";

export default function Card({
  candidate,
  onClick,
}: {
  candidate: Candidate;
  onClick: () => Promise<void>;
}) {
  return (
    <div
      className="flex flex-col items-center bg-slate-500 p-4 text-center rounded-xl w-64 cursor-pointer transition duration-200 hover:scale-110"
      onClick={onClick}
    >
      <img className="w-32 m-6" src={Profile} />
      <div className="text-2xl">{candidate.name}</div>
      <div className="font-thin">{candidate.description}</div>
    </div>
  );
}
