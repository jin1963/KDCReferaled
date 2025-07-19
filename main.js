let web3;
let contract;
let userAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      await checkNetwork();

      contract = new web3.eth.Contract(abi, contractAddress);

      document.getElementById("status").innerText = `Connected: ${shortenAddress(userAccount)}`;
      showReferralLink();
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  } else {
    alert("MetaMask or Bitget Wallet not detected.");
  }
});

async function connectWallet() {
  if (!window.ethereum) return alert("Wallet not found.");

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAccount = accounts[0];
    await checkNetwork();

    contract = new web3.eth.Contract(abi, contractAddress);

    document.getElementById("status").innerText = `Connected: ${shortenAddress(userAccount)}`;
    showReferralLink();
  } catch (err) {
    console.error("Connect Wallet Error:", err);
  }
}

function shortenAddress(addr) {
  return addr.substring(0, 6) + "..." + addr.slice(-4);
}

async function checkNetwork() {
  const chainId = await web3.eth.getChainId();
  if (chainId !== targetChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(targetChainId) }]
      });
    } catch (switchError) {
      alert("Please switch to BNB Smart Chain in your wallet.");
    }
  }
}

function showReferralLink() {
  const currentUrl = window.location.origin + window.location.pathname;
  const refLink = `${currentUrl}?ref=${userAccount}`;
  document.getElementById("referralLink").value = refLink;
  document.getElementById("referralBox").style.display = "block";
}

function copyReferralLink() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");
  alert("Referral link copied!");
}

async function registerReferrer() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = urlParams.get('ref');

  if (!referrer || referrer.toLowerCase() === userAccount.toLowerCase()) {
    return alert("Invalid referrer.");
  }

  try {
    await contract.methods.registerReferrer(referrer).send({ from: userAccount });
    alert("Registered referrer successfully.");
  } catch (err) {
    console.error("Registration failed:", err);
    alert("Failed to register referrer.");
  }
}

async function recordPurchase() {
  const amountStr = prompt("Enter purchase amount in USD:");
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount < 10) {
    return alert("Minimum purchase amount is 10 USDT.");
  }

  try {
    await contract.methods.recordPurchase(userAccount, web3.utils.toWei(amount.toString(), 'ether')).send({ from: userAccount });
    alert("Purchase recorded and rewards distributed.");
  } catch (err) {
    console.error("Purchase failed:", err);
    alert("Failed to record purchase.");
  }
}
