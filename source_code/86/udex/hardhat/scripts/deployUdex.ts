import { ethers } from "hardhat"

async function main() {
    const [account0] = await ethers.getSigners()
    console.log('account used:', account0.address)
    const chainId = (await account0.provider.getNetwork()).chainId

    const Factory = await ethers.getContractFactory("UdexFactory")
    const factory = await Factory.deploy()
    await factory.deployed()

    const Router = await ethers.getContractFactory("UdexRouter")
    const router = await Router.deploy(factory.address)
    await router.deployed()

    // JSON data for contracts.json
    console.log(JSON.stringify({chainId, factory: factory.address, router: router.address}))
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })