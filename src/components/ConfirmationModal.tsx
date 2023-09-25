import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmationModal({
  selectedCandidate,
  onClose,
  onVote,
  loading,
}: {
  selectedCandidate: number;
  onClose: () => void;
  onVote: () => void;
  loading: boolean;
}) {
  return (
    <div className="z-2 flex flex-col items-center justify-center bg-slate-600 text-white rounded-lg p-8 fixed bottom-1/2 text-xl text-center h-1/3 w-1/3">
      {!loading && (
        <>
          <div className="text-3xl">
            {selectedCandidate === 0
              ? `Burning Vote`
              : `Casting Vote for Candidate ${selectedCandidate}`}
          </div>
          <div className="font-light mt-12">
            Are you sure you want to proceed? <br /> Once your vote is casted,
            it CANNOT be changed.
          </div>
          <div className="flex w-full justify-evenly mt-8">
            <Button
              className="bg-slate-500 border-2"
              label="Cancel"
              onClick={onClose}
            />
            <Button label="Confirm" onClick={onVote} />
          </div>
        </>
      )}
      {loading && <LoadingSpinner />}
    </div>
  );
}
