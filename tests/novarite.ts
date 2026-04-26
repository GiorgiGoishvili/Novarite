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

  // ── Shared setup: player2 with airdrop and derived PDAs ───────────────────
  let player2: anchor.web3.Keypair;
  let player2DevPda: PublicKey;
  let player2AccessPassPda: PublicKey;

  before(async () => {
    player2 = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      player2.publicKey,
      2_000_000_000
    );
    await provider.connection.confirmTransaction(sig);

    [player2DevPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("developer"), player2.publicKey.toBuffer()],
      program.programId
    );
    [player2AccessPassPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("access"), gamePda.toBuffer(), player2.publicKey.toBuffer()],
      program.programId
    );
  });

  // ── Existing test 1 ───────────────────────────────────────────────────────
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
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("InvalidFee"),
        `Expected InvalidFee but got: ${msg}`
      );
    }
  });

  it("fails when platform fee is exactly 10001 (off-by-one boundary)", async () => {
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
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("InvalidFee"),
        `Expected InvalidFee but got: ${msg}`
      );
    }
  });

  // ── Existing test 2 ───────────────────────────────────────────────────────
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

  // ── Existing test 3 ───────────────────────────────────────────────────────
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

  it("fails when studio name exceeds 50 characters", async () => {
    const longName = "A".repeat(51);
    try {
      await program.methods
        .registerDeveloper(longName, "https://example.com")
        .accounts({
          developerProfile: player2DevPda,
          authority: player2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();
      assert.fail("Expected StudioNameTooLong error");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("StudioNameTooLong"),
        `Expected StudioNameTooLong but got: ${msg}`
      );
    }
  });

  // ── Existing test 4 ───────────────────────────────────────────────────────
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

  it("fails to publish game when title is empty", async () => {
    const [emptyTitleGamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), developerPda.toBuffer(), Buffer.from("test-empty-title")],
      program.programId
    );
    try {
      await program.methods
        .publishGame("test-empty-title", "", "https://example.com", new anchor.BN(0))
        .accounts({
          gameListing: emptyTitleGamePda,
          developerProfile: developerPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Expected EmptyGameTitle error");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      const msg: string = err.message ?? "";
      assert.ok(
        msg.includes("EmptyGameTitle"),
        `Expected EmptyGameTitle but got: ${msg}`
      );
    }
  });

  it("fails to publish game without a developer profile", async () => {
    const [player2GamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), player2DevPda.toBuffer(), Buffer.from("player2-game")],
      program.programId
    );
    try {
      await program.methods
        .publishGame("player2-game", "Player2 Game", "https://example.com", new anchor.BN(0))
        .accounts({
          gameListing: player2GamePda,
          developerProfile: player2DevPda,
          authority: player2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();
      assert.fail("Expected error — no developer profile exists");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      assert.ok(err.message, "Expected error when no developer profile exists");
    }
  });

  // ── Existing test 5 (updated: adds platformConfig + platformAuthority) ─────
  it("buys access pass", async () => {
    await program.methods
      .buyAccessPass()
      .accounts({
        accessPass: accessPassPda,
        gameListing: gamePda,
        developerWallet: authority.publicKey,
        platformConfig: platformPda,
        platformAuthority: authority.publicKey,
        player: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const pass = await program.account.accessPass.fetch(accessPassPda);
    assert.ok(pass.player.equals(authority.publicKey));
    assert.ok(pass.game.equals(gamePda));
  });

  it("fails to claim reward without an access pass", async () => {
    const [player2RewardPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reward"),
        gamePda.toBuffer(),
        player2.publicKey.toBuffer(),
        Buffer.from(rewardId),
      ],
      program.programId
    );
    try {
      await program.methods
        .claimReward(rewardId)
        .accounts({
          playerReward: player2RewardPda,
          gameListing: gamePda,
          accessPass: player2AccessPassPda,
          player: player2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();
      assert.fail("Expected error — player has no access pass");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      assert.ok(err.message, "Expected error when player has no access pass");
    }
  });

  it("platform fee is deducted from player during buyAccessPass", async () => {
    // access_pass space = 8 (discriminator) + 32 + 32 + 8 + 1 = 81 bytes
    const rentExemption = await provider.connection.getMinimumBalanceForRentExemption(81);
    const player2Before = await provider.connection.getBalance(player2.publicKey);

    await program.methods
      .buyAccessPass()
      .accounts({
        accessPass: player2AccessPassPda,
        gameListing: gamePda,
        developerWallet: authority.publicKey,
        platformConfig: platformPda,
        platformAuthority: authority.publicKey,
        player: player2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    const player2After = await provider.connection.getBalance(player2.publicKey);
    const price = 500_000_000;
    const feeBps = 250;
    const expectedFee = Math.floor((price * feeBps) / 10_000);

    // player2 pays price + fee + rent; authority (the provider) pays the tx fee
    assert.equal(
      player2Before - player2After,
      price + expectedFee + rentExemption,
      "Player should pay developer price plus platform fee plus account rent"
    );
  });

  // ── Existing test 6 (updated: adds accessPass account) ────────────────────
  it("claims reward", async () => {
    await program.methods
      .claimReward(rewardId)
      .accounts({
        playerReward: rewardPda,
        gameListing: gamePda,
        accessPass: accessPassPda,
        player: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const reward = await program.account.playerReward.fetch(rewardPda);
    assert.equal(reward.rewardId, rewardId);
    assert.ok(reward.player.equals(authority.publicKey));
  });

  it("update_game: non-developer signer gets constraint error", async () => {
    try {
      await program.methods
        .updateGame("Hacked Title", null, null)
        .accounts({
          gameListing: gamePda,
          developerProfile: developerPda,
          authority: player2.publicKey,
        })
        .signers([player2])
        .rpc();
      assert.fail("Expected constraint error for non-developer signer");
    } catch (err: any) {
      if (err.name === "AssertionError") throw err;
      assert.ok(err.message, "Expected error for non-developer signer");
    }
  });

  // ── Existing test 7 ───────────────────────────────────────────────────────
  it("fails when studio name is empty", async () => {
    const emptyStudioPlayer = anchor.web3.Keypair.generate();

    const sig = await provider.connection.requestAirdrop(
      emptyStudioPlayer.publicKey,
      2_000_000_000
    );
    await provider.connection.confirmTransaction(sig);

    const [emptyStudioDevPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("developer"), emptyStudioPlayer.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .registerDeveloper("", "https://example.com")
        .accounts({
          developerProfile: emptyStudioDevPda,
          authority: emptyStudioPlayer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([emptyStudioPlayer])
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
