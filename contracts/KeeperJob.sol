pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface UniOracleFactory {
    function update(address tokenA, address tokenB) external;
}

interface IKeep3rV1 {
    function isMinKeeper(address keeper, uint minBond, uint earned, uint age) external returns (bool);

    function receipt(address credit, address keeper, uint amount) external;

    function unbond(address bonding, uint amount) external;

    function withdraw(address bonding) external;

    function bond(address keeper, address credit) external view returns (uint);

    function unbond(address keeper, address credit) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function jobs(address job) external view returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface Swapper {
    function swap(uint amount) external;
}

contract KeeperJob {

    uint256 timer;
    bool isWorkable = false;
    Swapper swapper;
    IKeep3rV1 public constant KP3R = IKeep3rV1(0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44);

    constructor(Swapper _swapper) {
        swapper = _swapper;
    }

    function work() public {
        workable;
        swapper.swap(2);
        isWorkable = false;
    }

    function workable() public {
        require(block.timestamp - timer > 10 minutes, 'Need to wait 10 minutes');
        timer = block.timestamp;
        isWorkable = true;
    }

    receive() external payable { }

}