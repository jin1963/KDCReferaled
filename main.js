let web3;
let userAddress;
let contract;

window.onload = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAddress = accounts[0];
      contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      document.getElementById("walletStatus").innerText = `Connected: ${userAddress}`;
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) {
        document.getElementById("referrerAddress").innerText = ref;
      }
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  } else {
    alert("Please install MetaMask or Bitget Wallet");
  }
};

async function registerReferrer() {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (!ref || !web3.utils.isAddress(ref)) {
    alert("Invalid referrer address.");
    return;
  }
  try {
    await contract.methods.registerReferrer(ref).send({ from: userAddress });
    alert("Registered successfully.");
  } catch (err) {
    console.error("Register failed", err);
    alert("Registration failed.");
  }
}

async function recordPurchase() {
  const amount = prompt("Enter purchase amount in USDT:");
  if (!amount || isNaN(amount) || Number(amount) < 10) {
    alert("Minimum 10 USDT required.");
    return;
  }
  try {
    await contract.methods.recordPurchase(userAddress, web3.utils.toWei(amount, "ether")).send({ from: userAddress });
    alert("Purchase recorded.");
  } catch (err) {
    console.error("Purchase failed", err);
    alert("Purchase failed.");
  }
}

function copyReferralLink() {
  const link = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
  navigator.clipboard.writeText(link);
  alert("Referral link copied.");
}
