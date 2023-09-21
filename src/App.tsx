/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import { init, createFhevmInstance } from "./fhevmjs";
import { ethers } from "ethers";
import { getInstance } from "./fhevmjs";
import v2 from "../src/abi/v2.json";
import Candidate from "./interfaces/Candidate";
import Button from "./components/Button";
import Card from "./components/Card";
import Banner from "./components/Banner";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [voterAddress, setVoterAddress] = useState("");
  const [winner, setWinner] = useState(0);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [mintError, setMintError] = useState(false);
  const [votingError, setVotingError] = useState(false);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = "0x9c952C683AD47DE9770D906E6B805308C5B93107";
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

  let instance: any;
  let publicKey: any;
  const startup = async () => {
    await init();
    await createFhevmInstance();
    instance = getInstance();
    publicKey = instance.generateToken({
      verifyingContract: CONTRACT_ADDRESS,
    }).publicKey;
    setIsInitialized(true);
  };

  let provider;
  let signer;
  let votingCenterContract: ethers.Contract;
  const connectWallet = async () => {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const votingCenterAddress = CONTRACT_ADDRESS;
    votingCenterContract = new ethers.Contract(
      votingCenterAddress,
      v2.abi,
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

  useEffect(() => {
    startup().catch((e) => console.log("init failed", e));
    connectWallet().catch((e) => console.log("connect wallet failed", e));
  });

  const voteForCandidate = async (candidateID: number) => {
    try {
      setLoading(true);
      const encryptedVote = await instance.encrypt8(candidateID);
      const tx = await votingCenterContract.vote(encryptedVote);
      await tx.wait();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(`Error voting for candidate ${candidateID}`, e);
      setVotingError(true);
    }
  };

  const checkWinner = async () => {
    setLoading(true);
    const winner = await votingCenterContract.checkWinner(publicKey);
    const decryptedWinner = instance.decrypt(
      CONTRACT_ADDRESS,
      winner as string
    );
    setWinner(decryptedWinner);
    setLoading(false);
  };

  if (!isInitialized) return null;

  return (
    <div className="flex flex-col items-center font-display p-12 h-screen text-white">
      <h1 className="text-6xl font-thin">deVOTE</h1>
      {/* <div className="flex flex-col items-center">
        <h2>Mint for User</h2>
        <input
          placeholder="Voter Address"
          value={voterAddress}
          onChange={voterHandler}
        ></input>
        <Button label="Mint" onClick={mintForVoter} />
        {mintError && <div className="errorMessage">Minting Error</div>}
      </div> */}

      <div className="flex flex-wrap gap-8 items-center justify-center my-8">
        {candidates.map((candidate) => (
          <Card
            candidate={candidate}
            onClick={async () => {
              await voteForCandidate(candidate.id);
            }}
          />
        ))}
      </div>
      <Banner />

      <div className="flex flex-col items-center mt-8">
        <Button
          className="bg-slate-500"
          label="Reveal Winner"
          onClick={async () => {}}
        />
        <div className="text-4xl font-thin mt-4">{candidates[winner].name}</div>
      </div>
      <hr className="h-1 my-8 w-full bg-white border-0 dark:bg-white"/>
      <div className="w-full mt-4 bottom-4 left-4">
        <div className="flex flex-col w-1/3">
          <div className="flex">
            <div>Voting Contract:</div>
            <div className="grow" />
            <div>{CONTRACT_ADDRESS}</div>
          </div>
          <div className="flex">
            <div>Voting Token:</div>
            <div className="grow" />
            <div>{CONTRACT_ADDRESS}</div>
          </div>
          <div className="flex">
            <div>Election Organiser:</div>
            <div className="grow" />
            <div>{CONTRACT_ADDRESS}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
