require("dotenv").config();
const { ethers } = require("ethers");

const network = process.env.ETHEREUM_TEST_NETWORK;
const provider = new ethers.InfuraProvider(network, process.env.INFURA_API_KEY);
const RECIEVER = "0x1d22Afbd9b63280ea6742c34e7900e11e45945eA";

async function main() {
  const privateKey = process.env.SENDER_PRIVATE_KEY;
  const signer = new ethers.Wallet(privateKey).connect(provider);

  // 1. 準備原始交易物件 (尚未發送)
  const txData = {
    to: RECIEVER,
    value: ethers.parseUnits("0.001", 18),
  };

  try {
    console.log("--- 開始估算 Gas ---");
    
    // 2. 估算 Gas Limit (這筆交易需要多少能量)
    const estimatedGas = await signer.estimateGas(txData);
    console.log(`預估消耗 Gas: ${estimatedGas.toString()}`);

    // 3. 獲取當前網路的 Gas Price (每單位能量多少錢)
    const feeData = await provider.getFeeData();
    console.log(`當前 Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);

    // 4. 計算總成本 = Gas Limit * Gas Price
    const totalCost = estimatedGas * feeData.gasPrice;
    console.log(`預計最大手續費: ${ethers.formatUnits(totalCost, 18)} ETH`);

    // 5. 組合並送出交易
    // 我們手動把估算好的 gasLimit 補進去
    const transaction = await signer.sendTransaction({
      ...txData,
      gasLimit: estimatedGas,
      gasPrice: feeData.gasPrice, // 或者使用 maxFeePerGas (EIP-1559)
    });

    console.log("交易已送出，Hash:", transaction.hash);

    const receipt = await transaction.wait();
    console.log("交易已確認: ", receipt);

  } catch (error) {
    console.error("估算或交易失敗:", error.message);
    // 如果這裡報錯，通常是因為帳戶餘額連 0.001 + 手續費都不夠
  }
}

main().catch(console.error);