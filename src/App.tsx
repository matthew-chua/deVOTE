/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useContext, useEffect, useState } from "react";
import { init, createFhevmInstance, getInstance } from "./fhevmjs";
import { ethers } from "ethers";
import v2 from "../src/abi/v2.json";
import Candidate from "./interfaces/Candidate";
import Button from "./components/Button";
import Card from "./components/Card";
import Banner from "./components/Banner";
import ConfirmationModal from "./components/ConfirmationModal";
import Overlay from "./components/Overlay";
import { ContractContext } from "./main";
import { CONTRACT_ADDRESS } from "./constants/Addresses";
import Footer from "./components/Footer";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [winner, setWinner] = useState(0);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [burnable, setBurnable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);

  const [votingCenterContractState, setVotingCenterContractState] =
    useState<ethers.Contract>();
  const [instanceState, setInstanceState] = useState<any>();

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
    // const { contractState, setContractState } = useContext(ContractContext);
    // setContractState(votingCenterContract);
    setVotingCenterContractState(votingCenterContract);
    const owner = await votingCenterContract.owner();
    setOwner(owner);
    const tokenAddress = await votingCenterContract.votingTokenAddress();
    setVotingTokenAddress(tokenAddress);
    const mandatoryVoting = await votingCenterContract.mandatoryVoting();
    setBurnable(!mandatoryVoting);
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

  const clickCardHandler = (candidateID: number) => {
    setOpenConfirmationModal(true);
    setSelectedCandidate(candidateID);
  };

  if (!isInitialized) return null;

  return (
    <div className="flex flex-col items-center font-display text-white">
      <h1 className="text-6xl font-thin mt-12">deVOTE</h1>

      <div className="flex flex-wrap gap-8 items-center justify-center my-8">
        {candidates.map((candidate) => (
          <Card
            candidate={candidate}
            key={candidate.id}
            onClick={() => {
              clickCardHandler(candidate.id);
            }}
            showResults={false}
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
      <Footer
        owner={owner}
        votingTokenAddress={votingTokenAddress}
        contractAddress={CONTRACT_ADDRESS}
      />

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
