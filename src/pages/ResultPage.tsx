import Card from "../components/Card";
import Candidate from "../interfaces/Candidate";

export default function ResultPage() {
  const candidates: Candidate[] = [
    {
      id: 1,
      name: "Candidate 1",
      description:
        "Lorem ipsum blah blah blah some description about the candidate goes here.",
    },
    {
      id: 2,
      name: "Candidate 2",
      description:
        "Lorem ipsum blah blah blah some description about the candidate goes here.",
    },
    {
      id: 3,
      name: "Candidate 3",
      description:
        "Lorem ipsum blah blah blah some description about the candidate goes here.",
    },
  ];

  return (
    <div className="flex flex-col items-center font-display px-4 h-screen text-white">
      <h1 className="text-6xl font-thin mt-12">deVOTE</h1>
      <h3 className="text-3xl  mt-12">View Election Results</h3>
      <div className="flex flex-wrap gap-8 items-center justify-center my-8">
        {candidates.map((candidate) => (
          <Card candidate={candidate} key={candidate.id} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
}
