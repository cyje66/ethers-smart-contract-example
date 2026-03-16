require("dotenv").config()
const { ethers } = require("ethers")

// Setup connection
// 1. instantiate provider via JsonRpcProvider
// const URL = process.env.TENDERLY_RPC_URL
// const provider = new ethers.JsonRpcProvider(URL);

// 2. instantiate provider via InfuaProvider
const network = process.env.ETHEREUM_TEST_NETWORK;

const provider = new ethers.InfuraProvider(
  network,
  process.env.INFURA_API_KEY
);


const RECIEVER = "0x1d22Afbd9b63280ea6742c34e7900e11e45945eA" // Your account address 2

async function main() {
  const privateKey = process.env.SENDER_PRIVATE_KEY

  // Setup wallet
  // const wallet = new ethers.Wallet(privateKey, provider)
  // Creating a signing account from a private key
  const signer = new ethers.Wallet(privateKey).connect(provider);

  // Get balances
  const senderBalanceBefore = await provider.getBalance(signer.address)
  const recieverBalanceBefore = await provider.getBalance(RECIEVER)

  // Log balances
  console.log(`\nSender balance before: ${ethers.formatUnits(senderBalanceBefore, 18)}`)
  console.log(`Reciever balance before: ${ethers.formatUnits(recieverBalanceBefore, 18)}\n`)

  // Create transaction
  const transaction = await signer.sendTransaction({
    to: RECIEVER,
    value: ethers.parseUnits("0.001", 18)
  })
  console.log(transaction)
  console.log("\n")

  // Wait transaction
  const receipt = await transaction.wait()
  console.log(receipt)

  // Get balances
  const senderBalanceAfter = await provider.getBalance(signer.address)
  const recieverBalanceAfter = await provider.getBalance(RECIEVER)

  // Log balances
  console.log(`\nSender balance after: ${ethers.formatUnits(senderBalanceAfter, 18)}`)
  console.log(`Reciever balance after: ${ethers.formatUnits(recieverBalanceAfter, 18)}\n`)
}

main()