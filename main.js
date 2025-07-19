let web3;
let contract;
let user;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      user = accounts[0];
      document.getElementById("walletAddress").innerText = `✅ Connected: ${user}`;
      contract = new web3.eth.Contract(abi, contractAddress);
      document.getElementById("referralSection").style.display = "block";

      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref");
      if (ref) {
        document.getElementById("referrerDisplay").innerText = `Referrer: ${ref}`;
      }

      const referralLink = `${window.location.origin + window.location.pathname}?ref=${user}`;
      document.getElementById("refLink").value = referralLink;
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet.");
    }
  } else {
    alert("Please install MetaMask or Bitget Wallet.");
  }
});

function connectWallet() {
  window.ethereum.request({ method: 'eth_requestAccounts' });
}

function copyReferralLink() {
  const input = document.getElementById("refLink");
  input.select();
  document.execCommand("copy");
  alert("Referral link copied!");
}

async function registerReferrer() {
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (!ref || ref.toLowerCase() === user.toLowerCase()) {
    alert("❌ Invalid or missing referrer.");
    return;
  }

  try {
    await contract.methods.registerReferrer(ref).send({ from: user });
    alert("✅ Referrer registered successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Registration failed.");
  }
}

async function recordPurchase() {
  const amount = prompt("Enter total USDT value of purchase:");
  if (!amount || isNaN(amount) || amount <= 0) {
    alert("❌ Invalid amount.");
    return;
  }

  try {
    await contract.methods.recordPurchase(user, web3.utils.toWei(amount, "ether")).send({ from: user });
    alert("✅ Purchase recorded and rewards distributed.");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to record purchase.");
  }
}
