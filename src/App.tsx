/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import "./App.css";
import { init, createFhevmInstance } from "./fhevmjs";
import { ethers } from "ethers";
import { getInstance } from "./fhevmjs";

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
      verifyingContract: "0xBb775bd464A5a37D8c67B0DCcC52B9848A991ddd",
    }).publicKey;
    setIsInitialized(true);
  };

  let provider;
  let signer;
  let votingCenterContract: ethers.Contract;
  const connectWallet = async () => {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const votingCenterAddress = "0xBb775bd464A5a37D8c67B0DCcC52B9848A991ddd";
    const votingCenterABI = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "votingTime",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
        ],
        name: "checkWinner",
        outputs: [
          {
            internalType: "bytes",
            name: "",
            type: "bytes",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "endTime",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_to",
            type: "address",
          },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes",
            name: "encryptedVote",
            type: "bytes",
          },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "votingTokenAddress",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];
    votingCenterContract = new ethers.Contract(
      votingCenterAddress,
      votingCenterABI,
      signer
    );
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
    startup().catch((e) => console.log("HEREREEE init failed", e));
    connectWallet().catch((e) => console.log("connect wallet failed", e));
  });

  const voteForCandidate1 = async () => {
    try {
      const encryptedVote = instance.encrypt8(1);
      const tx = await votingCenterContract.vote(encryptedVote);
      console.log(tx);
    } catch (e) {
      console.log("error voting for candidate 1", e);
      setVotingError(true);
    }
  };

  const voteForCandidate2 = async () => {
    try {
      const encryptedVote = instance.encrypt8(2);
      const tx = await votingCenterContract.vote(encryptedVote);
      console.log(tx);
    } catch (e) {
      console.log("error voting for candidate 2", e);
      setVotingError(true);
    }
  };

  const checkWinner = async () => {
    const winner = await votingCenterContract.checkWinner(publicKey);
    const decryptedWinner = instance.decrypt(
      "0xBb775bd464A5a37D8c67B0DCcC52B9848A991ddd",
      winner as string
    );
    console.log(decryptedWinner);
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
        <button className="button" onClick={voteForCandidate1}>
          Vote for Candidate 1
        </button>
        <button className="button" onClick={voteForCandidate2}>
          Vote for Candidate 2
        </button>
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
