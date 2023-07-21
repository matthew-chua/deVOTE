// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "./VotingToken.sol";

contract VotingCenter {

    // mapping(euint8 => euint32) internal votes;
    euint32 private candidate1;
    euint32 private candidate2;
    
    uint256 public endTime;
    address public owner;
    address public votingTokenAddress;
    VotingToken votingToken;
    
    constructor(uint votingTime) {
        
        candidate1 = TFHE.asEuint32(0);
        candidate2 = TFHE.asEuint32(0);
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
        ebool candidate1Win = TFHE.gt(candidate1, candidate2);
        euint8 winner = TFHE.cmux(candidate1Win, TFHE.asEuint8(1), TFHE.asEuint8(2));

        return TFHE.reencrypt(winner, publicKey, 0);
    }

    //input should be encrypted, called from the FE
    function vote(bytes calldata encryptedVote) public {
        // require(block.timestamp < endTime, "Voting is over");
        
        //transfer voting token from voter to VotingCenter, to prevent double voting
        require(votingToken.transferFrom(msg.sender), "Voter has already voted.");

        euint8 votee = TFHE.asEuint8(encryptedVote);
        ebool voteCandidate1 = TFHE.eq(votee, TFHE.asEuint8(1));
        euint8 candidate1Increment = TFHE.cmux(voteCandidate1, TFHE.asEuint8(1), TFHE.asEuint8(0));
        euint8 candidate2Increment = TFHE.cmux(voteCandidate1, TFHE.asEuint8(0), TFHE.asEuint8(1));
        candidate1 = TFHE.add(candidate1Increment, candidate1);
        candidate2 = TFHE.add(candidate2Increment, candidate2);
    }
}