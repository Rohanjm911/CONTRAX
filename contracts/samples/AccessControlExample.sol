pragma solidity ^0.8.20;

contract AccessControlExample {
    address public owner;
    mapping(address => uint256) public treasury;

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external {
        require(tx.origin == owner, "Only owner can transfer ownership");
        owner = newOwner;
    }

    function drainTreasury(address payable recipient) external {
        recipient.transfer(address(this).balance);
    }

    receive() external payable {}
}
