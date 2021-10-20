async function main() {
    const Swapper = await ethers.getContractFactory("Swapper")

    // Start deployment, returning a promise that resolves to a contract object
    const swapper = await Swapper.deploy('0x6b175474e89094c44da98b954eedeac495271d0f', "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    console.log("Contract deployed to address:", swapper.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
