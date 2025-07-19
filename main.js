let web3;
let contract;
let user;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      user = accounts[0];
      document.getElementById("walletAddress").innerText = "✅ Connected: " + user;

      contract = new web3.eth.Contract(abi, contractAddress);

      // ตรวจ ref จาก URL
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && ref.toLowerCase() !== user.toLowerCase()) {
        document.getElementById("referrerInfo").innerText = "Referrer: " + ref;
      }

      const referralLink = `${window.location.origin}${window.location.pathname}?ref=${user}`;
      document.getElementById("referralLink").value = referralLink;
      document.getElementById("refLinkSection").style.display = "block";

      // เปลี่ยนไป BNB Smart Chain
      await switchToBSC();
    } catch (err) {
      console.error(err);
      document.getElementById("walletAddress").innerText = "❌ Connection failed.";
    }
  } else {
    alert("Please install MetaMask or Bitget Wallet.");
  }
});

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (e) {
    alert("Please switch to BNB Smart Chain.");
  }
}

document.getElementById("connectWallet").onclick = async () => {
  await window.ethereum.request({ method: "eth_requestAccounts" });
};

document.getElementById("registerReferrer").onclick = async () => {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (!ref || ref.toLowerCase() === user.toLowerCase()) {
    alert("Invalid referrer");
    return;
  }

  try {
    await contract.methods.registerReferrer(ref).send({ from: user });
    alert("✅ Referrer registered successfully.");
  } catch (err) {
    alert("❌ Failed: " + err.message);
  }
};

document.getElementById("buyKJC").onclick = async () => {
  const amount = document.getElementById("usdtAmount").value;
  if (!amount || isNaN(amount) || Number(amount) < 10) {
    alert("❌ Enter valid amount (min 10 USDT)");
    return;
  }

  try {
    const decimals = await contract.methods.usdt().call()
      .then(addr => new web3.eth.Contract(abi, addr).methods.decimals().call());

    const amountIn = web3.utils.toBN(amount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));

    await contract.methods.buyWithReferral(amountIn.toString()).send({ from: user });
    alert("✅ Purchase & rewards processed!");
  } catch (err) {
    alert("❌ Transaction failed: " + err.message);
  }
};

function copyReferralLink() {
  const copyText = document.getElementById("referralLink");
  copyText.select();
  document.execCommand("copy");
  alert("Copied: " + copyText.value);
}
