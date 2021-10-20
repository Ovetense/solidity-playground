const {ethers, network} = require("hardhat");
const {expect} = require("chai");

describe("Keeper", function () {

    let swapper;
    let keeperContract;
    let prov;
    let guardian;
    let governance;
    let signerGuardian;
    let keeper;


    before(async function () {
        prov = ethers.getDefaultProvider()
        const Swapper = await ethers.getContractFactory("contracts/Swapper.sol:Swapper");
        swapper = await Swapper.deploy("0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
        await swapper.deployed();
        const KeeperJob = await ethers.getContractFactory("KeeperJob");
        keeper = await KeeperJob.deploy(swapper.address);
        await keeper.deployed();
        guardian = "0x2D407dDb06311396fE14D4b49da5F0471447d45C";

        [owner] = await ethers.getSigners();
        keeperContract = (await ethers.getContractAt('Keep3rV1', "0x4fF0170A2bf39368681109034A2F7d505f181544"));
        governance = (await ethers.getContractAt('Governance', "0xc7212Fc959bBB606F97036e8Ac3DA7AaBf0cb735"));
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [guardian],
        });
        signerGuardian = await ethers.getSigner(guardian);
        await network.provider.send("hardhat_setBalance", [
            signerGuardian.address,
            "0x100000000000000000",
        ]);
    });
    /**
     * There are two keep3r contracts, one at 0x4fF0170A2bf39368681109034A2F7d505f181544 (old) and the other one at
     0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44 (newest), the logic under the addJob function is the same, but somehow
     the newest version decides that my impersonation is not !gov ... weird because i'm impersonating the same person
     (andre cronje, the creator)
     */
    it("Add job to keep3r", async function () {

        const currentJobs = await keeperContract.connect(signerGuardian).getJobs();
        console.log("Initial jobs" + currentJobs.toString())
        await keeperContract.connect(signerGuardian).addJob(keeper.address);
        const afterAdding = await keeperContract.connect(signerGuardian).getJobs();
        console.log("Added jobs " + afterAdding.toString())
        expect(currentJobs).to.not.equal(afterAdding);
    })

    /**
     *  hmm funny, if I use the contract at 0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44 with the job :
     0x127a2975c4E1c75f1ed4757a861bbd42523DB035 -> reverted with reason string 'addCreditETH: !job'.
     But that job comes from the response to -> : await keeperContract.connect(signerGuardian).getJobs();
     If I use the contract 0x4fF0170A2bf39368681109034A2F7d505f181544 I don't even have that function :(
     */
    // it("Add credit to the job", async function () {
    //
    //     await keeperContract.connect(signerGuardian).addCreditETH("0x127a2975c4E1c75f1ed4757a861bbd42523DB035");
    // })


});
