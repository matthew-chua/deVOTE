import { useEffect, useState } from "react";
import { init, createFhevmInstance, getInstance } from "../fhevmjs";
import { ethers } from "ethers";

import Card from "../components/Card";
import Footer from "../components/Footer";
import Candidate from "../interfaces/Candidate";

import { CONTRACT_ADDRESS } from "../constants/Addresses";
import { CANDIDATES } from "../constants/Candidates";
import v2 from "../abi/v2.json";

export default function ResultPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [votingCenterContractState, setVotingCenterContractState] =
    useState<ethers.Contract>();
  const [instanceState, setInstanceState] = useState<any>();

  const [count1, setCount1] = useState<Number>(0);
  const [count2, setCount2] = useState<Number>(0);
  const [count3, setCount3] = useState<Number>(0);
  const [winner, setWinner] = useState<Number>(0);

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
    const winner = await votingCenterContract.viewWinner();
    setWinner(Number(winner));
  };

  const viewVoteCount = async (candidateID: Number): Promise<Number> => {
    const voteCount =
      await votingCenterContractState?.viewVoteCount(candidateID);
    return Number(voteCount);
  };

  const fetchAllCounts = async () => {
    const c1 = await viewVoteCount(1);
    setCount1(c1);
    const c2 = await viewVoteCount(2);
    setCount2(c2);
    const c3 = await viewVoteCount(3);
    setCount3(c3);
  };

  useEffect(() => {
    fetchAllCounts();
  }, [votingCenterContractState]);

  useEffect(() => {
    startup().catch((e) => console.log("init failed", e));
    connectWallet().catch((e) => console.log("connect wallet failed", e));
  }, []);

  return (
    <div className="flex flex-col items-center font-display px-4 h-screen text-white">
      <h1 className="text-6xl font-thin mt-12">deVOTE</h1>
      <h3 className="text-3xl  mt-12">View Election Results</h3>
      <div className="flex flex-wrap gap-8 items-center justify-center my-8">
        {CANDIDATES.map((candidate) => (
          <Card
            candidate={candidate}
            key={candidate.id}
            onClick={() => {}}
            showResults={true}
            winner={winner === candidate.id}
            voteCount={
              candidate.id === 1 ? count1 : candidate.id === 2 ? count2 : count3
            }
          />
        ))}
      </div>
      <Footer
        owner={owner}
        contractAddress={CONTRACT_ADDRESS}
        votingTokenAddress={votingTokenAddress}
      />
    </div>
  );
}
