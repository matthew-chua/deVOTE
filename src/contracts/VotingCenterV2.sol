// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "./VotingToken.sol";

contract VotingCenter {


    euint32[] private candidates;
    
    //contains the ID of the candidate with the higest votes currently
    euint8 private winnerID;

    euint32 private highestVotes;
    
    uint256 public endTime;
    address public owner;
    address public votingTokenAddress;
    VotingToken votingToken;
    
    constructor(uint votingTime, uint numberOfCandidates) {
        
        for (uint i=0; i<numberOfCandidates; i++){
            candidates.push(TFHE.asEuint32(0));
        }
        
        owner = msg.sender;
        endTime = block.timestamp + votingTime;
        votingToken = new VotingToken(address(this));
        votingTokenAddress = address(votingToken);
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
        require(votingToken.transferFrom(msg.sender), "Voter has already voted.");

        euint8 votee = TFHE.sub(TFHE.asEuint8(encryptedVote), TFHE.asEuint8(1));
        for (uint i=0; i<candidates.length; i++) {
            euint8 condition = TFHE.asEuint8(TFHE.eq(votee, TFHE.asEuint8(i)));
            candidates[i] = TFHE.add(candidates[i], condition);
            ebool newWinner = TFHE.gt(candidates[i], highestVotes);
            highestVotes = TFHE.cmux(newWinner, candidates[i], highestVotes);
            winnerID = TFHE.cmux(newWinner, TFHE.asEuint8(i), winnerID);
        }
    }
}