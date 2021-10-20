pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Swapper {
    IERC20 public fromToken;
    IERC20 public toToken;

    constructor(
        address _fromToken,
        address _toToken
    ) {
        fromToken = IERC20(_fromToken);
        toToken = IERC20(_toToken);
    }

    mapping(address => uint256) public provided;

    function provide(uint256 amount) public payable {
        fromToken.transferFrom(msg.sender,address(this), amount);
        provided[msg.sender] += amount;
    }

    function withdraw() public {
        toToken.transfer(msg.sender, provided[msg.sender]);
        provided[msg.sender] = 0;
    }

    function swap(uint256 amount) public {
        provide(amount);
        withdraw();
    }

    function balanceProvided(address account) external view returns (uint256) {
        return provided[account];
    }

    function getFromToken() public view returns (IERC20) {
        return fromToken;
    }

    function getToToken() public view returns (IERC20) {
        return toToken;
    }
}