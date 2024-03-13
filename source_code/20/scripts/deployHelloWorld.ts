import { ethers } from "ethers";

async function main(){
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY)
    console.log('SEPOLIA_URL:', process.env.SEPOLIA_URL)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});