/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import { init, createFhevmInstance, getInstance } from "./fhevmjs";
import { ethers } from "ethers";
import v2 from "../src/abi/v2.json";
import Candidate from "./interfaces/Candidate";
import Button from "./components/Button";
import Card from "./components/Card";
import Banner from "./components/Banner";
import ConfirmationModal from "./components/ConfirmationModal";
import Overlay from "./components/Overlay";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [voterAddress, setVoterAddress] = useState("");
  const [winner, setWinner] = useState(0);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [burnable, setBurnable] = useState(false);
  const [mintError, setMintError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);

  const [votingCenterContractState, setVotingCenterContractState] =
    useState<ethers.Contract>();
  const [instanceState, setInstanceState] = useState<any>();

  const CONTRACT_ADDRESS = "0xEC8872629351EedE971549dc69C0E7cBe94Be69e";
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

  const changeNetwork = async () => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x1F49",
          rpcUrls: ["https://devnet.zama.ai"],
          chainName: "Zama Devnet",
          nativeCurrency: {
            name: "ZAMA",
            symbol: "ZAMA",
            decimals: 18,
          },
        },
      ],
    });
  };

  let instance: any;
  const startup = async () => {
    await changeNetwork();
    await init();
    await createFhevmInstance();
    instance = getInstance();
    setInstanceState(instance);
    setIsInitialized(true);
  };

  let provider: any;
  let signer: any;
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
    setVotingCenterContractState(votingCenterContract);
    const owner = await votingCenterContract.owner();
    setOwner(owner);
    const tokenAddress = await votingCenterContract.votingTokenAddress();
    setVotingTokenAddress(tokenAddress);
    const mandatoryVoting = await votingCenterContract.mandatoryVoting();
    setBurnable(!mandatoryVoting);
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
  }, []);

  const voteForCandidate = async (candidateID: number): Promise<void> => {
    try {
      setLoading(true);
      const encryptedVote = await instanceState.encrypt8(candidateID);
      const tx = await votingCenterContractState?.vote(encryptedVote, {
        gasLimit: 10000000,
      });
      await tx.wait();
      console.log(tx);
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      setLoading(false);
      console.log(`Error voting for candidate ${candidateID}`, e);
    }
  };

  const checkWinner = async () => {
    const winner = await votingCenterContractState?.viewWinner();
    setWinner(Number(winner));
  };

  const viewVoteCount = async (candidateID: Number) => {
    const voteCount =
      await votingCenterContractState?.viewVoteCount(candidateID);
    console.log(voteCount);
  };

  const clickCardHandler = (candidateID: number) => {
    setOpenConfirmationModal(true);
    setSelectedCandidate(candidateID);
  };

  if (!isInitialized) return null;

  return (
    <div className="flex flex-col items-center font-display px-4 h-screen text-white">
      <h1 className="text-6xl font-thin mt-12">deVOTE</h1>
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

      <div className="flex flex-wrap gap-8 items-center justify-center my-8">
        {candidates.map((candidate) => (
          <Card
            candidate={candidate}
            key={candidate.id}
            onClick={() => {
              clickCardHandler(candidate.id);
            }}
          />
        ))}
      </div>
      {burnable && (
        <Banner
          setOpenConfirmationModal={setOpenConfirmationModal}
          setSelectedCandidate={setSelectedCandidate}
        />
      )}
      <div className="flex flex-col items-center mt-8">
        <Button
          className="bg-slate-500"
          label="Reveal Winner"
          onClick={checkWinner}
        />
        <div className="text-2xl font-thin mt-4">
          {winner === 0 ? `Tie` : candidates[winner - 1].name}
        </div>
      </div>
      <hr className="h-1 my-4 w-full bg-white border-1" />
      <div className="w-full bottom-4 left-4">
        <div className="flex flex-col w-1/3">
          <div className="flex">
            <div>Voting Contract:</div>
            <div className="grow" />
            <a
              href={`https://main.explorer.zama.ai/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              className="w-80 hover:underline"
            >
              {CONTRACT_ADDRESS}
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

      {openConfirmationModal && (
        <>
          <Overlay
            loading={loading}
            onClick={() => {
              setOpenConfirmationModal(false);
            }}
          />
          <ConfirmationModal
            success={success}
            setSuccess={setSuccess}
            selectedCandidate={selectedCandidate}
            onClose={() => {
              setOpenConfirmationModal(false);
            }}
            onVote={() => {
              voteForCandidate(selectedCandidate);
            }}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

export default App;
