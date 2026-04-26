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
        emit!(PlatformInitialized {
            authority: ctx.accounts.authority.key(),
            platform_fee_bps,
        });
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
        emit!(DeveloperRegistered {
            authority: profile.authority,
            studio_name: profile.studio_name.clone(),
        });
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
        listing.developer = ctx.accounts.developer_profile.authority;
        listing.game_slug = game_slug;
        listing.title = title;
        listing.metadata_uri = metadata_uri;
        listing.price_lamports = price_lamports;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.game_listing;
        emit!(GamePublished {
            developer: listing.developer,
            game_slug: listing.game_slug.clone(),
            price_lamports: listing.price_lamports,
        });
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

        let fee_bps = ctx.accounts.platform_config.platform_fee_bps as u64;
        if fee_bps > 0 {
            let fee = price * fee_bps / 10_000;
            if fee > 0 {
                let fee_ix = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.player.key(),
                    &ctx.accounts.platform_authority.key(),
                    fee,
                );
                anchor_lang::solana_program::program::invoke(
                    &fee_ix,
                    &[
                        ctx.accounts.player.to_account_info(),
                        ctx.accounts.platform_authority.to_account_info(),
                    ],
                )?;
            }
        }

        let pass = &mut ctx.accounts.access_pass;
        pass.game = ctx.accounts.game_listing.key();
        pass.player = ctx.accounts.player.key();
        pass.purchased_at = Clock::get()?.unix_timestamp;
        pass.bump = ctx.bumps.access_pass;
        emit!(AccessPassPurchased {
            game: pass.game,
            player: pass.player,
            price_lamports: price,
        });
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
        emit!(RewardClaimed {
            game: reward.game,
            player: reward.player,
            reward_id: reward.reward_id.clone(),
        });
        Ok(())
    }

    pub fn update_game(
        ctx: Context<UpdateGame>,
        title: Option<String>,
        metadata_uri: Option<String>,
        price_lamports: Option<u64>,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.game_listing;
        if let Some(t) = title {
            require!(!t.is_empty(), NovariteError::GameTitleEmpty);
            require!(t.len() <= 80, NovariteError::GameTitleTooLong);
            listing.title = t;
        }
        if let Some(uri) = metadata_uri {
            require!(uri.len() <= 200, NovariteError::MetadataUriTooLong);
            listing.metadata_uri = uri;
        }
        if let Some(price) = price_lamports {
            listing.price_lamports = price;
        }
        emit!(GameUpdated {
            developer: listing.developer,
            game_slug: listing.game_slug.clone(),
            title: listing.title.clone(),
            metadata_uri: listing.metadata_uri.clone(),
            price_lamports: listing.price_lamports,
        });
        Ok(())
    }

    pub fn transfer_platform_authority(
        ctx: Context<TransferPlatformAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let old_authority = ctx.accounts.authority.key();
        ctx.accounts.platform_config.authority = new_authority;
        emit!(PlatformAuthorityTransferred {
            old_authority,
            new_authority,
        });
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

    #[account(
        mut,
        constraint = developer_wallet.key() == game_listing.developer @ NovariteError::InvalidDeveloperWallet
    )]
    pub developer_wallet: SystemAccount<'info>,

    #[account(
        seeds = [b"platform"],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    /// CHECK: receives platform fee, validated by platform_config.authority constraint
    #[account(
        mut,
        constraint = platform_authority.key() == platform_config.authority
    )]
    pub platform_authority: UncheckedAccount<'info>,

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

    #[account(
        seeds = [b"access", game_listing.key().as_ref(), player.key().as_ref()],
        bump = access_pass.bump,
        constraint = access_pass.player == player.key() @ NovariteError::AccessPassRequired,
        constraint = access_pass.game == game_listing.key() @ NovariteError::AccessPassRequired,
    )]
    pub access_pass: Account<'info, AccessPass>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGame<'info> {
    #[account(
        mut,
        seeds = [b"game", developer_profile.key().as_ref(), game_listing.game_slug.as_bytes()],
        bump = game_listing.bump,
        constraint = game_listing.developer == developer_profile.key(),
    )]
    pub game_listing: Account<'info, GameListing>,

    #[account(
        mut,
        seeds = [b"developer", authority.key().as_ref()],
        bump = developer_profile.bump,
        has_one = authority,
    )]
    pub developer_profile: Account<'info, DeveloperProfile>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferPlatformAuthority<'info> {
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump,
        has_one = authority,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    pub authority: Signer<'info>,
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
    #[msg("Developer wallet does not match game listing")]
    InvalidDeveloperWallet,
    #[msg("Player does not own an access pass for this game")]
    AccessPassRequired,
    #[msg("Game title cannot be empty")]
    GameTitleEmpty,
}

// ─── Events ──────────────────────────────────────────────────────────────────

#[event]
pub struct PlatformInitialized {
    pub authority: Pubkey,
    pub platform_fee_bps: u16,
}

#[event]
pub struct DeveloperRegistered {
    pub authority: Pubkey,
    pub studio_name: String,
}

#[event]
pub struct GamePublished {
    pub developer: Pubkey,
    pub game_slug: String,
    pub price_lamports: u64,
}

#[event]
pub struct AccessPassPurchased {
    pub game: Pubkey,
    pub player: Pubkey,
    pub price_lamports: u64,
}

#[event]
pub struct RewardClaimed {
    pub game: Pubkey,
    pub player: Pubkey,
    pub reward_id: String,
}

#[event]
pub struct GameUpdated {
    pub developer: Pubkey,
    pub game_slug: String,
    pub title: String,
    pub metadata_uri: String,
    pub price_lamports: u64,
}

#[event]
pub struct PlatformAuthorityTransferred {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
}
