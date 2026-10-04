pragma solidity ^0.8.20;

contract TimestampExample {
    uint256 public lotteryJackpot;
    address public lastWinner;

    function playLottery() external payable {
        require(msg.value == 0.1 ether, "Requires 0.1 ETH");
        lotteryJackpot += msg.value;

        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));

        if (random % 2 == 0 && block.timestamp % 15 == 0) {
            payable(msg.sender).transfer(lotteryJackpot);
            lastWinner = msg.sender;
            lotteryJackpot = 0;
        }
    }
}
