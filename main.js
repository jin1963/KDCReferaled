const contractAddress = "0x25D071772bd2Dc0f5ACe31631fa25f8A4B0bdcF2";
const abi = [ /* วาง ABI ของคุณที่นี่ หากใช้แยกไฟล์ ให้ลิงก์ผ่าน abi.js */ ];

let web3;
let userAddress;
let contract;

async function connectWallet() {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      document.getElementById("walletAddress").textContent = `✅ Connected: ${userAddress}`;

      contract = new web3.eth.Contract(abi, contractAddress);

      await switchToBSC();

      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");

      if (ref && ref.toLowerCase() !== userAddress.toLowerCase()) {
        try {
          await contract.methods.registerReferrer(ref).send({ from: userAddress });
          document.getElementById("referrerInfo").textContent = "Referrer: " + ref;
        } catch (err) {
          console.log("Referrer already registered or failed:", err.message);
        }
      }

      const referralLink = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
      document.getElementById("referralLink").value = referralLink;
      document.getElementById("refLinkSection").style.display = "block";
    } catch (err) {
      console.error(err);
      alert("⚠️ Wallet connection failed.");
    }
  } else {
    alert("⚠️ Please install MetaMask or Bitget Wallet.");
  }
}

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (e) {
    alert("⚠️ Please switch to BNB Smart Chain (Mainnet).");
  }
}

async function copyReferralLink() {
  const copyText = document.getElementById("referralLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("✅ Copied: " + copyText.value);
}

async function buyWithReferral() {
  const amountUSDT = prompt("Enter amount in USDT (min 10):");
  if (!amountUSDT || isNaN(amountUSDT) || Number(amountUSDT) < 10) {
    alert("⚠️ Invalid amount. Must be 10 or more.");
    return;
  }

  try {
    const decimals = 18; // USDT on BSC มักใช้ 18 decimals
    const amountWei = web3.utils.toWei(amountUSDT, 'ether');

    await contract.methods.buyWithReferral(amountWei).send({ from: userAddress });
    alert("✅ Purchase completed and referral rewards distributed.");
  } catch (err) {
    alert("❌ Failed: " + err.message);
  }
}
