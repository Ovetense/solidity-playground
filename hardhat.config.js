require("@nomiclabs/hardhat-waffle");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.4"
            },
            {
                version: "0.6.12"
            },
            {
                version: "0.4.18"
            }
        ]
    },
    networks: {
        hardhat: {
            forking: {
                url: "https://eth-mainnet.alchemyapi.io/v2/GowAY1qim-caYAprCHwEssHzkuQgx25d",
                blockNumber: 13437931,
                gas: 9999999
            },
            loggingEnabled : false
        },
        ropsten: {
            url: "https://eth-ropsten.alchemyapi.io/v2/GowAY1qim-caYAprCHwEssHzkuQgx25d",
            accounts: ['0xc70484d1f858634310b0672b8f64b1dcfcbabcd354d68507fcf0566fff6c0133']
        }
    }
};

