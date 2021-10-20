pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract UniSwapper {
    IUniswapV2Router02 uniswapRouter;
    address UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);

    }

    function convertEthToDai(uint ethAmount) public payable {
        uint deadline = block.timestamp + 60;
        uniswapRouter.swapETHForExactTokens{ value: msg.value }(ethAmount, getPathForETHtoDAI(), msg.sender, deadline);
        (bool success,) = msg.sender.call{value : address(this).balance}("");
        require(success, "refund failed");
        emit Debug(msg.value);
    }

    event Debug(
        uint256 ethToProvide
    );

    function getEstimatedETHforDAI(uint daiAmount) public view returns (uint[] memory) {
        return uniswapRouter.getAmountsIn(daiAmount, getPathForETHtoDAI());
    }

    function convertDaiToEth(uint _daiAmount) public payable {
        IERC20 contractDai = IERC20(DAI);
        uint daiAmount = _daiAmount;
        require(contractDai.approve(address(uniswapRouter), type(uint128).max), 'Approval failed');
//        require(contractDai.transferFrom(msg.sender, address(this), daiAmount), 'Failed transfer');
        uint deadline = block.timestamp + 60;
        uniswapRouter.swapExactTokensForETH(daiAmount,0, getPathForDAItoETH(), msg.sender, deadline);
        (bool success,) = msg.sender.call{value : address(this).balance}("");
        require(success, "refund failed");
        emit Debug(msg.value);
    }


    function getPathForETHtoDAI() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = DAI;

        return path;
    }

    function getPathForDAItoETH() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = address(DAI);
        path[1] = uniswapRouter.WETH();

    return path;
    }

    function depositEth() external payable {}
}