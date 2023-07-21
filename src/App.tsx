/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import "./App.css";
import { Devnet } from "./components/Devnet";
import { init, createFhevmInstance } from "./fhevmjs";
import { ethers } from "ethers";
import { getInstance } from "./fhevmjs";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [voterAddress, setVoterAddress] = useState("");
  const [winner, setWinner] = useState(-1);
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
    console.log(owner);
  };

  const getVotingTokenAddress = async () => {
    const votingTokenAddress = await votingCenterContract.votingTokenAddress();
    console.log(votingTokenAddress);
  };

  const mintForVoter = async () => {
    const tx = await votingCenterContract.mint(voterAddress);
    console.log(tx);
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
    }
  };

  const voteForCandidate2 = async () => {
    const encryptedVote = instance.encrypt8(2);
    const tx = await votingCenterContract.vote(encryptedVote);
    console.log(tx);
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
      <button onClick={getOwner}>Owner</button>
      <button onClick={getVotingTokenAddress}>Voting Token Address</button>
      <div>
        <h2>Mint for User</h2>
        <input
          placeholder="Voter Address"
          value={voterAddress}
          onChange={voterHandler}
        ></input>
        <button onClick={mintForVoter}>Mint</button>
      </div>
      <div>
        <h2>Vote</h2>
        <button onClick={voteForCandidate1}>Vote for Candidate 1</button>
        <button onClick={voteForCandidate2}>Vote for Candidate 2</button>
      </div>
      <div>
        <button onClick={checkWinner}>Check Winner</button>
        <div>{winner}</div>
      </div>
      <h1>fhevmjs</h1>
      <div className="card">
        <Devnet />
      </div>
      <p className="read-the-docs">
        <a href="https://docs.zama.ai/fhevm">
          See the documentation for more information
        </a>
      </p>
    </>
  );
}

export default App;
