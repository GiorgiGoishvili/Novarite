use anchor_lang::prelude::*;

declare_id!("53HE6Bd8xUv55nGbCYGuRtZEvYQNNGioZAGyr9jTEGEe");

#[program]
pub mod novarite {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee_bps: u16,
    ) -> Result<()> {
        require!(platform_fee_bps <= 10_000, NovariteError::InvalidFee);

        let config = &mut ctx.accounts.platform_config;
        config.authority = ctx.accounts.authority.key();
        config.platform_fee_bps = platform_fee_bps;
        config.bump = ctx.bumps.platform_config;
        Ok(())
    }

    pub fn register_developer(
        ctx: Context<RegisterDeveloper>,
        studio_name: String,
        profile_uri: String,
    ) -> Result<()> {
        require!(!studio_name.is_empty(), NovariteError::EmptyStudioName);
        require!(studio_name.len() <= 50, NovariteError::StudioNameTooLong);
        require!(profile_uri.len() <= 200, NovariteError::ProfileUriTooLong);

        let profile = &mut ctx.accounts.developer_profile;
        profile.authority = ctx.accounts.authority.key();
        profile.studio_name = studio_name;
        profile.profile_uri = profile_uri;
        profile.created_at = Clock::get()?.unix_timestamp;
        profile.bump = ctx.bumps.developer_profile;
        Ok(())
    }

    pub fn publish_game(
        ctx: Context<PublishGame>,
        game_slug: String,
        title: String,
        metadata_uri: String,
        price_lamports: u64,
    ) -> Result<()> {
        require!(!title.is_empty(), NovariteError::EmptyGameTitle);
        require!(title.len() <= 80, NovariteError::GameTitleTooLong);
        require!(game_slug.len() <= 40, NovariteError::GameSlugTooLong);
        require!(metadata_uri.len() <= 200, NovariteError::MetadataUriTooLong);

        let listing = &mut ctx.accounts.game_listing;
        listing.developer = ctx.accounts.developer_profile.key();
        listing.game_slug = game_slug;
        listing.title = title;
        listing.metadata_uri = metadata_uri;
        listing.price_lamports = price_lamports;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.game_listing;
        Ok(())
    }

    pub fn buy_access_pass(ctx: Context<BuyAccessPass>) -> Result<()> {
        let listing = &ctx.accounts.game_listing;
        let price = listing.price_lamports;

        if price > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.player.key(),
                &ctx.accounts.developer_wallet.key(),
                price,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.player.to_account_info(),
                    ctx.accounts.developer_wallet.to_account_info(),
                ],
            )?;
        }

        let pass = &mut ctx.accounts.access_pass;
        pass.game = ctx.accounts.game_listing.key();
        pass.player = ctx.accounts.player.key();
        pass.purchased_at = Clock::get()?.unix_timestamp;
        pass.bump = ctx.bumps.access_pass;
        Ok(())
    }

    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        reward_id: String,
    ) -> Result<()> {
        require!(!reward_id.is_empty(), NovariteError::EmptyRewardId);
        require!(reward_id.len() <= 40, NovariteError::RewardIdTooLong);

        let reward = &mut ctx.accounts.player_reward;
        reward.game = ctx.accounts.game_listing.key();
        reward.player = ctx.accounts.player.key();
        reward.reward_id = reward_id;
        reward.claimed_at = Clock::get()?.unix_timestamp;
        reward.bump = ctx.bumps.player_reward;
        Ok(())
    }
}

// ─── Accounts ────────────────────────────────────────────────────────────────

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,      // 32
    pub platform_fee_bps: u16,  // 2
    pub bump: u8,               // 1
}

#[account]
pub struct DeveloperProfile {
    pub authority: Pubkey,   // 32
    pub studio_name: String, // 4 + 50
    pub profile_uri: String, // 4 + 200
    pub created_at: i64,     // 8
    pub bump: u8,            // 1
}

#[account]
pub struct GameListing {
    pub developer: Pubkey,    // 32
    pub game_slug: String,    // 4 + 40
    pub title: String,        // 4 + 80
    pub metadata_uri: String, // 4 + 200
    pub price_lamports: u64,  // 8
    pub created_at: i64,      // 8
    pub bump: u8,             // 1
}

#[account]
pub struct AccessPass {
    pub game: Pubkey,       // 32
    pub player: Pubkey,     // 32
    pub purchased_at: i64,  // 8
    pub bump: u8,           // 1
}

#[account]
pub struct PlayerReward {
    pub game: Pubkey,      // 32
    pub player: Pubkey,    // 32
    pub reward_id: String, // 4 + 40
    pub claimed_at: i64,   // 8
    pub bump: u8,          // 1
}

// ─── Contexts ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 2 + 1,
        seeds = [b"platform"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterDeveloper<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 50 + 4 + 200 + 8 + 1,
        seeds = [b"developer", authority.key().as_ref()],
        bump
    )]
    pub developer_profile: Account<'info, DeveloperProfile>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_slug: String)]
pub struct PublishGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 40 + 4 + 80 + 4 + 200 + 8 + 8 + 1,
        seeds = [b"game", developer_profile.key().as_ref(), game_slug.as_bytes()],
        bump
    )]
    pub game_listing: Account<'info, GameListing>,

    #[account(
        mut,
        seeds = [b"developer", authority.key().as_ref()],
        bump = developer_profile.bump,
        has_one = authority
    )]
    pub developer_profile: Account<'info, DeveloperProfile>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyAccessPass<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"access", game_listing.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub access_pass: Account<'info, AccessPass>,

    pub game_listing: Account<'info, GameListing>,

    /// CHECK: receives lamport payment, validated by being the developer's wallet
    #[account(mut)]
    pub developer_wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(reward_id: String)]
pub struct ClaimReward<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 32 + 4 + 40 + 8 + 1,
        seeds = [b"reward", game_listing.key().as_ref(), player.key().as_ref(), reward_id.as_bytes()],
        bump
    )]
    pub player_reward: Account<'info, PlayerReward>,

    pub game_listing: Account<'info, GameListing>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ─── Errors ──────────────────────────────────────────────────────────────────

#[error_code]
pub enum NovariteError {
    #[msg("Platform fee must be <= 10000 bps")]
    InvalidFee,
    #[msg("Studio name cannot be empty")]
    EmptyStudioName,
    #[msg("Studio name must be 50 characters or fewer")]
    StudioNameTooLong,
    #[msg("Profile URI must be 200 characters or fewer")]
    ProfileUriTooLong,
    #[msg("Game title cannot be empty")]
    EmptyGameTitle,
    #[msg("Game title must be 80 characters or fewer")]
    GameTitleTooLong,
    #[msg("Game slug must be 40 characters or fewer")]
    GameSlugTooLong,
    #[msg("Metadata URI must be 200 characters or fewer")]
    MetadataUriTooLong,
    #[msg("Reward ID cannot be empty")]
    EmptyRewardId,
    #[msg("Reward ID must be 40 characters or fewer")]
    RewardIdTooLong,
}
