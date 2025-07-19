const contractAddress = "0x9B0Abb27524B2857322C2D3682c5bc819eDB6d73";
const abi = [ // ย่อส่วนเพื่อความกระชับ
  {"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"}],"name":"ReferralRegistered","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"RewardDistributed","type":"event"},
  {"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"registerReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"recordPurchase","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

let web3;
let userAddress;
let contract;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    document.getElementById("walletAddress").textContent = `✅ Connected: ${userAddress}`;

    contract = new web3.eth.Contract(abi, contractAddress);
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      document.getElementById("referrerInfo").textContent = "Referrer: " + ref;
    }

    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
    document.getElementById("referralLink").value = referralLink;
    document.getElementById("refLinkSection").style.display = "block";

    // Switch to BNB Chain (Mainnet)
    await switchToBSC();
  } else {
    alert("Please install MetaMask or Bitget Wallet.");
  }
}

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (e) {
    alert("Please switch to BNB Smart Chain in your wallet.");
  }
}

async function copyReferralLink() {
  const copyText = document.getElementById("referralLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("Copied: " + copyText.value);
}

async function registerReferrer() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  if (!ref || ref.toLowerCase() === userAddress.toLowerCase()) {
    alert("Invalid referrer address.");
    return;
  }

  try {
    await contract.methods.registerReferrer(ref).send({ from: userAddress });
    alert("Referrer registered successfully.");
  } catch (err) {
    alert("Register failed: " + err.message);
  }
}

async function recordPurchase() {
  const amount = prompt("Enter purchase amount in KJC:");
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert("Invalid amount.");
    return;
  }

  try {
    await contract.methods.recordPurchase(userAddress, web3.utils.toWei(amount, 'ether')).send({ from: userAddress });
    alert("Purchase recorded & rewards distributed!");
  } catch (err) {
    alert("Failed to record purchase: " + err.message);
  }
}
