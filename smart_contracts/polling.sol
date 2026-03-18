// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    
    // 1. struct: 定義候選人的資料結構
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // 2. address & mapping: 記錄誰投過票了，防止重複投票
    // key 是地址，value 是布林值
    mapping(address => bool) public hasVoted;

    // 3. storage: 狀態變數會永久儲存在區塊鏈上 (Storage)
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;

    // 4. event: 當投票發生時，通知外部前端網頁
    event votedEvent(uint256 indexed _candidateId);

    // 建構子：初始化兩位候選人
    constructor() {
        addCandidate("Alice");
        addCandidate("Bob");
    }

    // 內部函式：新增候選人
    function addCandidate(string memory _name) private {
        candidatesCount++;
        // 建立 struct 並存入 mapping (storage)
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // 5. 核心投票函式
    function vote(uint256 _candidateId) public {
        // A. require & msg.sender: 檢查投票者地址是否投過票
        require(!hasVoted[msg.sender], "You have already voted!");

        // B. require: 檢查候選人編號是否有效
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        // C. storage vs memory: 
        // 我們從「硬碟」(storage) 抓出該候選人的資料來修改
        Candidate storage candidate = candidates[_candidateId];
        
        // 修改資料
        candidate.voteCount++;
        
        // 標記該 msg.sender (目前操作者) 已投票
        hasVoted[msg.sender] = true;

        // D. emit event: 觸發事件
        emit votedEvent(_candidateId);
    }
}