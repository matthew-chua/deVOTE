export default function Footer({
  contractAddress,
  votingTokenAddress,
  owner,
}: {
  contractAddress: string;
  votingTokenAddress: string;
  owner: string;
}) {
  return (
    <div className="flex flex-col w-full fixed bottom-4 px-4">
      <hr className="h-1 my-4 w-full bg-white border-1" />
      <div className="w-full bottom-4 left-4">
        <div className="flex flex-col w-1/3">
          <div className="flex">
            <div>Voting Contract:</div>
            <div className="grow" />
            <a
              href={`https://main.explorer.zama.ai/address/${contractAddress}`}
              target="_blank"
              className="w-80 hover:underline"
            >
              {contractAddress}
            </a>
          </div>
          <div className="flex">
            <div>Voting Token:</div>
            <div className="grow" />
            <a
              href={`https://main.explorer.zama.ai/address/${votingTokenAddress}`}
              target="_blank"
              className="w-80 hover:underline"
            >
              {votingTokenAddress}
            </a>
          </div>
          <div className="flex">
            <div>Campaign Organiser:</div>
            <div className="grow" />
            <a
              href={`https://main.explorer.zama.ai/address/${owner}`}
              target="_blank"
              className="w-80 hover:underline"
            >
              {owner}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
