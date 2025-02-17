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

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const TREASURY_WALLET = [
  46, 3, 20, 65, 77, 127, 19, 154, 45, 232, 163, 127, 122, 122, 42, 29, 218,
  157, 174, 216, 152, 130, 8, 72, 97, 35, 232, 119, 192, 44, 56, 79, 11, 219,
  68, 0, 73, 106, 63, 173, 175, 245, 230, 47, 52, 62, 164, 172, 123, 95, 54, 46,
  248, 70, 162, 56, 87, 163, 69, 188, 89, 203, 158, 61,
];

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
  const elementOpacity = element.style.opacity;
  element.style.opacity = 0;

  const {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
  } = solanaWeb3;

  const wallet = await getWallet();
  const connection = new Connection("https://api.devnet.solana.com");

  const receiver = new PublicKey(charge.address);
  const treasuryWallet = Keypair.fromSecretKey(
    Uint8Array.from(TREASURY_WALLET),
  );

  const tx = new Transaction()
    .add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: receiver,
        lamports: Math.floor(charge.sol * LAMPORTS_PER_SOL),
      }),
    )
    .add(
      ...(await createTransferTokenInstructions({
        connection,
        from: treasuryWallet.publicKey,
        to: wallet.publicKey,
        amount: charge.tokens,
      })),
    );
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = await connection
    .getLatestBlockhash()
    .then(({ blockhash }) => blockhash);
  tx.partialSign(treasuryWallet);

  console.log(
    "serialized transaction",
    tx.serialize({ requireAllSignatures: false }).toString("base64"),
  );

  return wallet.signAndSendTransaction(tx).then((signature) => {
    store[page] = {
      signature,
      charge,
    };
    sessionStorage.chargeTable = JSON.stringify(store);
    element.style.opacity = elementOpacity;
    return signature;
  });
}

const TOKEN_ADDRESS = "oraGe2DRKNoYUZ1uG9kMU5pwbCv6TT57HGm7XY1UgeC";
const TOKEN_DECIMALS = 6;
async function createTransferTokenInstructions({
  connection,
  from,
  to,
  amount,
}) {
  const { PublicKey, TransactionInstruction } = solanaWeb3;

  const mint = new PublicKey(TOKEN_ADDRESS);
  const rawAmount = Math.floor(amount * 10 ** TOKEN_DECIMALS);

  const sourceAta = getAssociatedTokenAccountSync(mint, from);
  const destinationAta = getAssociatedTokenAccountSync(mint, to);

  const instructions = [];
  const destinationAtaAccount = await connection.getAccountInfo(destinationAta);
  if (destinationAtaAccount?.owner.toString() != TOKEN_PROGRAM_ID) {
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        to,
        destinationAta,
        to,
        mint,
      ),
    );
  }
  instructions.push(
    createTransferInstruction(sourceAta, destinationAta, from, rawAmount),
  );

  return instructions;
}

function getAssociatedTokenAccountSync(mint, owner) {
  const { PublicKey } = solanaWeb3;
  const [address] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      new PublicKey(TOKEN_PROGRAM_ID).toBuffer(),
      mint.toBuffer(),
    ],
    new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
  );
  return address;
}

function createAssociatedTokenAccountIdempotentInstruction(
  payer,
  associatedToken,
  owner,
  mint,
) {
  const { PublicKey, SystemProgram, TransactionInstruction } = solanaWeb3;
  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey(TOKEN_PROGRAM_ID),
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
    data: Buffer.from([1]),
  });
}

function createTransferInstruction(source, destination, owner, amount) {
  const { PublicKey, SystemProgram, TransactionInstruction } = solanaWeb3;

  const data = Buffer.alloc(9);
  data[0] = 3;
  data.writeBigUInt64LE(BigInt(amount), 1);

  return new TransactionInstruction({
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: new PublicKey(TOKEN_PROGRAM_ID),
    data,
  });
}
