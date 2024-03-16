import { useState, useEffect } from "react";
import Button from "../components/Button";
import { init, createFhevmInstance, getInstance } from "../fhevmjs";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../constants/Addresses";
import v2 from "../abi/v2.json";
import Footer from "../components/Footer";

export default function MintPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [votingTokenAddress, setVotingTokenAddress] = useState("");
  const [owner, setOwner] = useState("");
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
  };

  useEffect(() => {
    startup().catch((e) => console.log("init failed", e));
    connectWallet().catch((e) => console.log("connect wallet failed", e));
  }, [window.ethereum]);

  const [voterAddress, setVoterAddress] = useState("");
  const [mintError, setMintError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const mintForVoter = async (): Promise<void> => {
    setSuccess(false);
    setMintError(false);
    try {
      setLoading(true);
      const tx = await votingCenterContractState?.mint(voterAddress, {
        gasLimit: 10000000,
      });
      await tx.wait();
      console.log(tx);
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.log("error minting", e);
      setLoading(false);
      setMintError(true);
    }
  };

  const voterHandler = (e: any) => {
    setVoterAddress(e.target.value as string);
  };
  return (
    <div className="text-white font-display">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl mt-12 font-thin">Mint Voting Tokens</h1>
        <div className="my-4 text-xl">
          Enter the wallet address of the voter you want to register.
        </div>
        <input
          className="rounded-xl h-12 p-2 mb-4 w-96 text-gray-700"
          placeholder="Voter Address"
          value={voterAddress}
          onChange={voterHandler}
        ></input>
        <Button label="Mint" onClick={mintForVoter} />
        {mintError && <div className="errorMessage">Minting Error</div>}
        {loading && <div className="errorMessage">Minting...</div>}
        {success && <div className="errorMessage">Mint successful!</div>}
      </div>
      <Footer
        owner={owner}
        votingTokenAddress={votingTokenAddress}
        contractAddress={CONTRACT_ADDRESS}
      />
    </div>
  );
}
