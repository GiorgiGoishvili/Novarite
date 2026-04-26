import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

async function main(): Promise<void> {
  const providerUrl = process.env.ANCHOR_PROVIDER_URL;
  const walletPath = process.env.ANCHOR_WALLET;

  if (!providerUrl) {
    console.error("Error: ANCHOR_PROVIDER_URL environment variable is not set");
    process.exit(1);
  }
  if (!walletPath) {
    console.error("Error: ANCHOR_WALLET environment variable is not set");
    process.exit(1);
  }

  const idlPath = path.resolve(__dirname, "..", "target", "idl", "novarite.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  const connection = new anchor.web3.Connection(providerUrl, "confirmed");
  const keypairData = JSON.parse(
    fs.readFileSync(walletPath, "utf-8")
  ) as number[];
  const keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keypairData));
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);

  const programId = new PublicKey(idl.address);
  const program = new anchor.Program(idl as anchor.Idl, provider);

  const [platformPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );

  const existing = await provider.connection.getAccountInfo(platformPda);
  if (existing !== null) {
    console.log("Platform already initialized at:", platformPda.toBase58());
    process.exit(0);
  }

  const tx = await program.methods
    .initializePlatform(250)
    .accounts({
      platformConfig: platformPda,
      authority: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Platform PDA:", platformPda.toBase58());
  console.log("Transaction signature:", tx);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
