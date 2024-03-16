/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import { init, createFhevmInstance, getInstance } from "./fhevmjs";
import { ethers } from "ethers";

import Card from "./components/Card";
import Banner from "./components/Banner";
import ConfirmationModal from "./components/ConfirmationModal";
import Overlay from "./components/Overlay";
import Footer from "./components/Footer";

import { CONTRACT_ADDRESS } from "./constants/Addresses";
import { CANDIDATES } from "./constants/Candidates";
import v2 from "../src/abi/v2.json";
import ErrorAlert from "./components/ErrorAlert";

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
  const [error, setError] = useState(false);

  const [votingCenterContractState, setVotingCenterContractState] =
    useState<ethers.Contract>();
  const [instanceState, setInstanceState] = useState<any>();

  const changeNetwork = async () => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          // chainId: "0x2382",
          // rpcUrls: ["https://testnet.inco.org"],
          // chainName: "Inco Gentry Testnet",
          // nativeCurrency: {
          //   name: "INCO",
          //   symbol: "INCO",
          //   decimals: 18,
          // },
          // blockExplorerUrls: ["https://explorer.testnet.inco.org/"],
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

  useEffect(() => {
    console.log("how many times");
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
      setError(true);
      setOpenConfirmationModal(false);
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
        {CANDIDATES.map((candidate) => (
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
      <Footer
        owner={owner}
        votingTokenAddress={votingTokenAddress}
        contractAddress={CONTRACT_ADDRESS}
      />
      {error && (
        <>
          <Overlay
            loading={loading}
            onClick={() => {
              setError(false);
            }}
          />
          <ErrorAlert setError={setError} />
        </>
      )}

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
