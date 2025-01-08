let wallet;
let walletButton;

if (typeof window.buffer != "undefined") {
  window.Buffer = buffer.Buffer;
}

window.addEventListener("load", () => {
  connectWallet(true);

  walletButton = document.querySelector("button:has(.fa-wallet)");
  walletButton.addEventListener("click", connectWallet);

  if (!window.location.pathname.startsWith("/Hub")) {
    connectWallet();
  }

  chargeUserForPage();
});

async function connectWallet(autoconnect = false) {
  if (wallet) return;
  let connectPromise = window.solana
    .connect({ onlyIfTrusted: autoconnect })
    .then(() => setWallet(window.solana));
  if (autoconnect)
    connectPromise.catch((e) =>
      console.error(`autoconnect failed: ${e?.message}`),
    );
  return connectPromise;
}

function setWallet(newWallet) {
  wallet = newWallet;

  const publicKey = wallet.publicKey.toString();

  let walletAddress = document.querySelector("#wallet-address");
  if (!walletAddress) {
    walletAddress = document.createElement("span");
    walletAddress.id = "wallet-address";
    walletButton.parentElement.appendChild(walletAddress);
  }

  walletAddress.textContent =
    publicKey.substring(0, 4) +
    "..." +
    publicKey.substring(publicKey.length - 4);
}

async function getWallet() {
  if (!wallet) await connectWallet();
  return wallet;
}

const DEFAULT_CHARGE = { sol: 0.001, tokens: 100 };
function createCharge(address, { sol, tokens } = DEFAULT_CHARGE) {
  return {
    address,
    sol,
    tokens,
  };
}

const CHARGE_TABLE = {
  "/app/Netty/Netty01.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/Netty/Netty02.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/Netty/Netty03.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/Netty/Netty04.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/Netty/Netty05.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),

  "/app/RW/RW01.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/RW/RW02.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/RW/RW03.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/RW/RW04.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
  "/app/RW/RW05.html": createCharge(
    "3FVrkePokrBYhQKthGjpTr8MCsPAymTStHuPCsLZ6SLX",
  ),
};

async function chargeUserForPage() {
  let store = {};
  try {
    store = JSON.parse(sessionStorage.chargeTable);
  } catch (e) {
    console.error(
      `could not read charge table from session storage: ${e?.message}`,
    );
  }

  const page = window.location.pathname;
  const charge = CHARGE_TABLE[page];
  if (!charge || page in store) return true;
  const element = document.querySelector(".Body") ?? document.body;
  const elementTextColor = element.style.color;
  element.style.color = "transparent";

  const {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
  } = solanaWeb3;

  const wallet = await getWallet();
  const connection = new Connection("https://api.devnet.solana.com");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(charge.address),
      lamports: Math.floor(charge.sol * LAMPORTS_PER_SOL),
    }),
  );
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = await connection
    .getLatestBlockhash()
    .then(({ blockhash }) => blockhash);

  return wallet.signAndSendTransaction(tx).then((signature) => {
    store[page] = {
      signature,
      charge,
    };
    sessionStorage.chargeTable = JSON.stringify(store);
	element.style.color = elementTextColor;
    return signature;
  });
}
