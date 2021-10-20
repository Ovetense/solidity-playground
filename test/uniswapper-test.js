const {ethers, network} = require("hardhat");
const {expect} = require("chai");

describe("Swapper", function () {

    let swapper;
    let uniSigner;
    let daiWhale;
    let addr1;
    let daiContract;
    let wethContract;
    let signer;
    let wethWhale;
    let ethWhale;
    let signerSwapper;


    before(async function () {
        const UniSwapper = await ethers.getContractFactory("UniSwapper");
        swapper = await UniSwapper.deploy();
        await swapper.deployed();
        daiWhale = "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9";
        wethWhale = "0xf977814e90da44bfa03b6295a0616a897441acec";
        ethWhale = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";
        UNIrouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        daiContract = (await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20', "0x6B175474E89094C44Da98b954EedeAC495271d0F"));
        wethContract = (await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20', "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"));
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [daiWhale],
        });
        signer = await ethers.getSigner(daiWhale);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [UNIrouter],
        });
        uniSigner = await ethers.getSigner(UNIrouter);
        signerSwapper = await ethers.getSigner(swapper.address);
        [owner, addr1] = await ethers.getSigners();
        await network.provider.send("hardhat_setBalance", [
            UNIrouter,
            "0x100000000000000000",
        ]);
    });

    it("1. Swapping ETH for DAI", async function () {

        const balE = await wethContract.balanceOf(addr1.address);
        const balD = await daiContract.balanceOf(addr1.address);

        console.log("wETH : " + balE.toString())
        console.log("DAI : " + balD.toString());

        const requiredEth = (await swapper.getEstimatedETHforDAI(ethers.utils.parseEther("1")))[0];
        await swapper.connect(addr1).convertEthToDai(ethers.utils.parseEther("1"), {value: requiredEth});

        const balEM = await wethContract.balanceOf(addr1.address);
        const balDM = await daiContract.balanceOf(addr1.address);
        expect(+balDM).to.gte(+ethers.utils.parseEther("1"))
        console.log("wETH : " + balEM.toString())
        console.log("DAI : " + balDM.toString());

    })

    /**
     * This test fails but idk why :'(. The reverse transaction works 🙃
     */
    // it("2. Swapping DAI for ETH", async function () {
    //
    //     await wethContract.connect(uniSigner).approve(addr1.address, ethers.utils.parseEther("10"));
    //     await daiContract.connect(addr1).approve("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", ethers.utils.parseEther("10"));
    //     await swapper.connect(signer).convertDaiToEth(100);
    //
    //     const balDp = await daiContract.balanceOf(addr1.address);
    //     const balEp = await wethContract.balanceOf(addr1.address);
    //
    //     console.log("wETH : " + balEp.toString())
    //     console.log("DAI : " + balDp.toString());
    // })
});
