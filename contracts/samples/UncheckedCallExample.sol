pragma solidity ^0.8.20;

contract UncheckedCallExample {
    mapping(address => uint256) public userBalances;

    function sendFunds(address target, uint256 amount) external {
        target.call{value: amount}("");
        userBalances[target] += amount;
    }
}
