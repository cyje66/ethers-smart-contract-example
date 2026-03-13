require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { ethers } = require("ethers");

const provider = new ethers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);
const CONTRACT_ADDRESS = "0xd00b38e4c9d5a08E38260bE09640a4e9dF159DC5";

const ABI = [
  "function candidates(uint256) view returns (uint256 id, string name, uint256 voteCount)",
  "event votedEvent(uint256 indexed _candidateId)" // 必須要有這行才能解析事件
];

// 僅查看歷史紀錄通常只需要 provider，不需要 wallet
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function getPastEvents() {
  console.log("--- 正在檢索歷史投票紀錄 ---");

  // 1. 定義過濾器 (Filter)
  // 如果你想過濾特定的候選人，可以寫 contract.filters.votedEvent(1)
  const filter = contract.filters.votedEvent();

  // 2. 決定搜索範圍
  // "fromBlock": 開始區塊 (例如 5000000)
  // "toBlock": 結束區塊 (通常是 "latest")
  // 也可以用負數代表「從現在往回推幾個區塊」，例如 -1000 代表最近 1000 個區塊
  const startBlock = -5000000; 
  const endBlock = "latest";

  try {
    const events = await contract.queryFilter(filter, startBlock, endBlock);

    console.log(`總共找到 ${events.length} 筆投票事件：`);

    // 3. 解析事件內容
    for (const event of events) {
      // 在 v6 中，參數存在 event.args 裡
      const candidateId = event.args[0]; 
      const blockNumber = event.blockNumber;
      const txHash = event.transactionHash;

      console.log(`--------------------------------`);
      console.log(`event: ${JSON.stringify(event)}`)
      console.log(`[區塊 ${blockNumber}] 候選人 ID: ${candidateId}`);
      console.log(`交易 Hash: ${txHash}`);
    }

  } catch (error) {
    console.error("檢索失敗:", error);
  }
}

getPastEvents().catch(console.error);