// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "./VotingToken.sol";

contract VotingCenter {
    
    //contains the ID of the candidate with the higest votes currently
    euint8 private winnerID;

    euint32 private highestVotes;
    
    uint256 public endTime;
    address public owner;
    address public votingTokenAddress;
    uint8 public numberOfCandidates;
    VotingToken votingToken;
    mapping(uint => euint32) public candidateVotes;
    
    constructor(uint votingTime, uint8 _numberOfCandidates) {
        
        for (uint i=0; i<=numberOfCandidates; i++){
            candidateVotes[i] = TFHE.asEuint32(0);
        }
        owner = msg.sender;
        endTime = block.timestamp + votingTime;
        votingToken = new VotingToken(address(this));
        highestVotes = TFHE.asEuint32(0);
        winnerID = TFHE.asEuint8(0);
        votingTokenAddress = address(votingToken);
        numberOfCandidates = _numberOfCandidates;
    }

    //called by the backend script
    function mint(address _to) public {
        require(msg.sender == owner, "Only owner can mint");
        votingToken.mint(_to);
    }

    //return value needs to be decrypted on the FE
    function checkWinner(bytes32 publicKey) public view returns (bytes memory) {
        // require(block.timestamp > endTime, "Voting is still in progress");
        return TFHE.reencrypt(winnerID, publicKey, 0);
    }

    //input should be encrypted, called from the FE
    function vote(bytes calldata encryptedVote) public {
        // require(block.timestamp < endTime, "Voting is over");
        
        //transfer voting token from voter to VotingCenter, to prevent double voting
        // require(votingToken.transferFrom(msg.sender), "Voter has already voted.");

        euint8 votee = TFHE.asEuint8(encryptedVote);
        for (uint i=1; i<=numberOfCandidates; i++) {
            euint8 condition = TFHE.asEuint8(TFHE.eq(votee, TFHE.asEuint8(i)));
            euint32 newCount = TFHE.add(candidateVotes[i], condition);
            candidateVotes[i] = newCount;
            ebool newWinner = TFHE.gt(newCount, highestVotes);
            ebool tie = TFHE.eq(newCount, highestVotes);
            highestVotes = TFHE.cmux(newWinner, newCount, highestVotes);
            winnerID = TFHE.cmux(tie, TFHE.asEuint8(0), winnerID);
            winnerID = TFHE.cmux(newWinner, TFHE.asEuint8(i), winnerID);
        }
    }
}