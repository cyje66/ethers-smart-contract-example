// Require packages
require('dotenv').config()
const { ethers } = require("ethers")

// Setup connection
const URL = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
const provider = new ethers.JsonRpcProvider(URL);

const ADDRESS = '0x396343362be2A4dA1cE0C1C210945346fb82Aa49'

async function main() {
  // Get balance
  const balance = await provider.getBalance(ADDRESS)
  // Log balance
  console.log(`${ethers.formatUnits(balance, 18)}`)
}

main()