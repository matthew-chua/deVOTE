/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import "./App.css";
import { init, createFhevmInstance } from "./fhevmjs";
import { ethers } from "ethers";
import { getInstance } from "./fhevmjs";
import v1 from "../src/abi/v1.js";
import v2 from "../src/abi/v2.js";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [voterAddress, setVoterAddress] = useState("");
  const [winner, setWinner] = useState(-1);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [mintError, setMintError] = useState(false);
  const [votingError, setVotingError] = useState(false);

  let instance: any;
  let publicKey: any;
  const startup = async () => {
    await init();
    await createFhevmInstance();
    instance = getInstance();
    publicKey = instance.generateToken({
      verifyingContract: "0xbb2ef38c0084c45b9a3d1edf309272dd2b3963ab",
    }).publicKey;
    setIsInitialized(true);
  };

  let provider;
  let signer;
  let votingCenterContract: ethers.Contract;
  const connectWallet = async () => {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const votingCenterAddress = "0xbb2ef38c0084c45b9a3d1edf309272dd2b3963ab";
    votingCenterContract = new ethers.Contract(votingCenterAddress, v1, signer);
  };

  const getOwner = async () => {
    const owner = await votingCenterContract.owner();
    setOwner(owner);
  };

  const getVotingTokenAddress = async () => {
    const votingTokenAddress = await votingCenterContract.votingTokenAddress();
    setVotingTokenAddress(votingTokenAddress);
  };

  const mintForVoter = async () => {
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

  useEffect(() => {
    startup().catch((e) => console.log("init failed", e));
    connectWallet().catch((e) => console.log("connect wallet failed", e));
  });

  const voteForCandidate = async (candidateID: number) => {
    try {
      const encryptedVote = await instance.encrypt8(candidateID);
      const tx = await votingCenterContract.vote(encryptedVote);
      console.log(tx);
    } catch (e) {
      console.log(`Error voting for candidate ${candidateID}`, e);
      setVotingError(true);
    }
  };

  const checkWinner = async () => {
    const winner = await votingCenterContract.checkWinner(publicKey);
    const decryptedWinner = instance.decrypt(
      "0xbb2ef38c0084c45b9a3d1edf309272dd2b3963ab",
      winner as string
    );
    setWinner(decryptedWinner);
  };

  if (!isInitialized) return null;

  return (
    <>
      <h1>DeVOTE</h1>
      <div>On chain anonymous voting using FHE!</div>

      <div>
        <h2>Mint for User</h2>
        <input
          placeholder="Voter Address"
          value={voterAddress}
          onChange={voterHandler}
        ></input>
        <button className="button" onClick={mintForVoter}>
          Mint
        </button>
        {mintError && <div className="errorMessage">Minting Error</div>}
      </div>
      <div>
        <h2>Vote</h2>
        <button
          className="button"
          onClick={async () => {
            await voteForCandidate(1);
          }}
        >
          Vote for Candidate 1
        </button>
        <button
          className="button"
          onClick={async () => {
            await voteForCandidate(2);
          }}
        >
          Vote for Candidate 2
        </button>
        {/* <button
          className="button"
          onClick={async () => {
            await voteForCandidate(3);
          }}
        >
          Vote for Candidate 3
        </button> */}
        {votingError && <div className="errorMessage">Error Voting</div>}
      </div>
      <div>
        <h2>Results</h2>
        <button className="button" onClick={checkWinner}>
          Check Winner
        </button>
        <div>Winner: {winner}</div>
      </div>
      <div>
        <h2>Helper Functions</h2>
        <div className="bottomDiv">
          <div className="container">
            <button className="button" onClick={getOwner}>
              Owner
            </button>
            <div>
              Owner Address: <br /> {owner}
            </div>
          </div>
          <div className="container">
            <button className="button" onClick={getVotingTokenAddress}>
              Voting Token Address
            </button>
            <div>
              Voting Token Address: <br /> {votingTokenAddress}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
