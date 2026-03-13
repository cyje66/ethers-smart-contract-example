require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.InfuraProvider(
  "sepolia",
  process.env.INFURA_API_KEY
);

// 寫入操作需要 Wallet (包含私鑰)，讀取操作只需要 Provider
const privateKey = process.env.SENDER_PRIVATE_KEY
console.log("Private Key Length:", privateKey?.length);
const wallet = new ethers.Wallet(privateKey).connect(provider);

const CONTRACT_ADDRESS = "0xd00b38e4c9d5a08E38260bE09640a4e9dF159DC5";

// 根據剛才的投票合約定義的 ABI
const ABI = [
  "function candidatesCount() view returns (uint256)",
  "function candidates(uint256) view returns (uint256 id, string name, uint256 voteCount)",
  "function hasVoted(address) view returns (bool)",
  "function vote(uint256 _candidateId)",
  "event votedEvent(uint256 indexed _candidateId)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

async function main() {
  console.log("--- 開始與投票合約互動 ---");

  // 1. 調用 view 函式：讀取候選人總數 (免費)
  const count = await contract.candidatesCount();
  console.log("總候選人數:", count.toString());

  // 2. 調用 pure 函式：進行純計算 (免費)
  // const sum = await contract.add(10, 5);
  // console.log("Pure 運算結果 (10+5):", sum.toString());

  // 3. 調用 mapping：檢查自己是否投過票 (免費)
  const voted = await contract.hasVoted(wallet.address);
  console.log("我投過票了嗎？", voted ? "是" : "否");

  if (!voted) {
    // 4. 發送交易：進行投票 (需要付 Gas Fee)
    console.log("正在發送投票交易...");
    const tx = await contract.vote(1); // 假設投給 1 號 Alice
    console.log("交易已送出，Hash:", tx.hash);

    // 等待交易上鏈 (確認收據)
    const receipt = await tx.wait();
    console.log("投票成功！記錄在區塊高度:", receipt.blockNumber);
  } else {
    console.log("因為已投過票，跳過投票交易。");
  }

  // 5. 再次讀取：查看 1 號候選人的最新票數 (免費)
  const candidate = await contract.candidates(1);
  console.log(`候選人 1 號: ${candidate.name}, 目前票數: ${candidate.voteCount}`);
}

main().catch((error) => {
  console.error("發生錯誤:", error);
});