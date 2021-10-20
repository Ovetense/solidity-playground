const {ethers, network} = require("hardhat");
const {expect} = require("chai");

describe("Swapper", function () {

    let swapper;
    const balanceToDeposit = 100;
    const tokensBalance = 10000000;
    let daiWhale;
    let addr1;
    let contractTo;
    let contractFrom;
    let signer;
    let signerWeth;
    let wethWhale;
    let snapshotId;


    before(async function () {
        const Swapper = await ethers.getContractFactory("contracts/Swapper.sol:Swapper");
        swapper = await Swapper.deploy("0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
        await swapper.deployed();
        daiWhale = "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9";
        wethWhale = "0xf977814e90da44bfa03b6295a0616a897441acec";

        [owner, addr1] = await ethers.getSigners();

        contractFrom = (await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20', await swapper.getFromToken()));

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [daiWhale],
        });
        signer = await ethers.getSigner(daiWhale);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [wethWhale],
        });
        signerWeth = await ethers.getSigner(wethWhale);
        contractTo = (await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20', await swapper.getToToken()));
        await contractTo.connect(signerWeth).transfer(swapper.address, tokensBalance);
        snapshotId = await network.provider.request({
                method: 'evm_snapshot',
                params: []
        });
    });

    afterEach(async () => {
        await network.provider.request({
            method: 'evm_revert',
            params: [snapshotId],
        });
    });

    it("Provide fails because sender doesnt have balance", async function () {
        await expect(swapper.connect(addr1).provide(balanceToDeposit)).to.be.revertedWith("Dai/insufficient-balance");
        console.log("Dai/insufficient-balance");
    })

    it("Provide fails because sender didnt approve the transfer", async function () {
        await contractFrom.connect(signer).transfer(addr1.address, tokensBalance);
        expect(await contractFrom.balanceOf(addr1.address)).to.equal(tokensBalance);
        console.log("Transferred fromToken to Addr1 : " + tokensBalance);
        await expect(swapper.connect(addr1).provide(balanceToDeposit)).to.be.revertedWith("Dai/insufficient-allowance");
    })

    it("Should provide", async function () {
        await contractFrom.connect(addr1).approve(swapper.address, balanceToDeposit);
        await swapper.connect(addr1).provide(balanceToDeposit);
        expect(await swapper.balanceProvided(addr1.address)).to.equal(balanceToDeposit)
    });

    it("Should withdraw", async function () {
        expect(await swapper.balanceProvided(addr1.address)).to.equal(balanceToDeposit)
        await swapper.connect(addr1).withdraw();
        expect(await contractTo.balanceOf(addr1.address)).to.equals(balanceToDeposit);
    });

    it("Withdraw fails because there's no provided", async function () {
        expect(await swapper.balanceProvided(addr1.address)).to.equal(0)
        expect(swapper.connect(addr1).withdraw()).to.be.reverted;
    });

    it("Should swap contracts", async function () {
        await contractFrom.connect(addr1).approve(swapper.address, balanceToDeposit);
        console.log("Addr1 approves a deposit on the Swapper contract");
        const currentFromBal = await contractFrom.balanceOf(addr1.address);
        await swapper.connect(addr1).provide(balanceToDeposit);
        expect(await swapper.balanceProvided(addr1.address)).to.equal(balanceToDeposit)
        console.log("Addr1 provided : " + balanceToDeposit);
        expect(await contractFrom.balanceOf(addr1.address)).to.equal(currentFromBal - balanceToDeposit);
        console.log("Therefore the balance provided is gone to Swapper, remaining : " + (currentFromBal - balanceToDeposit));
        const currentToBal = await contractTo.balanceOf(addr1.address);
        await swapper.connect(addr1).withdraw();
        console.log("Addr1 withdraws from the toToken");
        expect(await contractFrom.balanceOf(addr1.address)).to.equal(currentFromBal - balanceToDeposit);
        console.log("Balance of the fromToken is still the same as before : " + (currentFromBal - balanceToDeposit));
        expect(await contractTo.balanceOf(addr1.address)).to.equal(currentToBal.toNumber() + balanceToDeposit);
        console.log("Addr1 now has " + (currentToBal + balanceToDeposit) + " toToken.");
        expect(await swapper.balanceProvided(addr1.address)).to.equal(0);
        console.log("How the withdraws are for all the total balance, now the provided balance is  0)");
    });

});
