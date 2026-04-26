import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { Novarite } from "../target/types/novarite";

describe("novarite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Novarite as Program<Novarite>;
  const authority = provider.wallet as anchor.Wallet;

  const [platformPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const [developerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("developer"), authority.publicKey.toBuffer()],
    program.programId
  );

  const gameSlug = "pixel-dungeon";

  const [gamePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("game"),
      developerPda.toBuffer(),
      Buffer.from(gameSlug),
    ],
    program.programId
  );

  const [accessPassPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("access"),
      gamePda.toBuffer(),
      authority.publicKey.toBuffer(),
    ],
    program.programId
  );

  const rewardId = "early-backer-001";

  const [rewardPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reward"),
      gamePda.toBuffer(),
      authority.publicKey.toBuffer(),
      Buffer.from(rewardId),
    ],
    program.programId
  );

  it("fails when platform fee is above 10000", async () => {
    try {
      await program.methods
        .initializePlatform(10_001)
        .accounts({
          platformConfig: platformPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Expected InvalidFee error");
    } catch (err: any) {
      // assert.fail() re-throws as AssertionError — don't swallow it
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("InvalidFee"),
        `Expected InvalidFee but got: ${msg}`
      );
    }
  });

  it("initializes platform", async () => {
    await program.methods
      .initializePlatform(250) // 2.5% fee
      .accounts({
        platformConfig: platformPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.platformConfig.fetch(platformPda);
    assert.ok(config.authority.equals(authority.publicKey));
    assert.equal(config.platformFeeBps, 250);
  });

  it("registers developer", async () => {
    await program.methods
      .registerDeveloper("Pixel Forge Studio", "https://pixelforge.io/profile.json")
      .accounts({
        developerProfile: developerPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const profile = await program.account.developerProfile.fetch(developerPda);
    assert.ok(profile.authority.equals(authority.publicKey));
    assert.equal(profile.studioName, "Pixel Forge Studio");
  });

  it("publishes game", async () => {
    await program.methods
      .publishGame(
        gameSlug,
        "Pixel Dungeon Adventure",
        "https://pixelforge.io/games/pixel-dungeon/metadata.json",
        new anchor.BN(500_000_000) // 0.5 SOL
      )
      .accounts({
        gameListing: gamePda,
        developerProfile: developerPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const listing = await program.account.gameListing.fetch(gamePda);
    assert.equal(listing.title, "Pixel Dungeon Adventure");
    assert.equal(listing.gameSlug, gameSlug);
  });

  it("buys access pass", async () => {
    await program.methods
      .buyAccessPass()
      .accounts({
        accessPass: accessPassPda,
        gameListing: gamePda,
        developerWallet: authority.publicKey,
        player: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const pass = await program.account.accessPass.fetch(accessPassPda);
    assert.ok(pass.player.equals(authority.publicKey));
    assert.ok(pass.game.equals(gamePda));
  });

  it("claims reward", async () => {
    await program.methods
      .claimReward(rewardId)
      .accounts({
        playerReward: rewardPda,
        gameListing: gamePda,
        player: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const reward = await program.account.playerReward.fetch(rewardPda);
    assert.equal(reward.rewardId, rewardId);
    assert.ok(reward.player.equals(authority.publicKey));
  });

  it("fails when studio name is empty", async () => {
    const player2 = anchor.web3.Keypair.generate();

    // Airdrop so it can pay for account
    const sig = await provider.connection.requestAirdrop(
      player2.publicKey,
      2_000_000_000
    );
    await provider.connection.confirmTransaction(sig);

    const [player2DevPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("developer"), player2.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .registerDeveloper("", "https://example.com")
        .accounts({
          developerProfile: player2DevPda,
          authority: player2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();
      assert.fail("Expected EmptyStudioName error");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("EmptyStudioName"),
        `Expected EmptyStudioName but got: ${msg}`
      );
    }
  });
});
