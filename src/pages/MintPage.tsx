import { useState } from "react";
import Button from "../components/Button";

export default function MintPage() {

  const [voterAddress, setVoterAddress] = useState("");
  const [mintError, setMintError] = useState(false);

  const mintForVoter = async (): Promise<void> => {
    try {
      const tx = await votingCenterContract.mint(voterAddress);
      console.log(tx);
    } catch (e) {
      console.log("error minting", e);
      setMintError(true);
    }
  };

  const voterHandler = (e: any) => {
    setVoterAddress(e.target.value as string);
  };
  return (
    <div>
      <div className="flex flex-col items-center">
        <h2>Mint for User</h2>
        <input
          placeholder="Voter Address"
          value={voterAddress}
          onChange={voterHandler}
        ></input>
        <Button label="Mint" onClick={mintForVoter} />
        {mintError && <div className="errorMessage">Minting Error</div>}
      </div>
    </div>
  );
}
