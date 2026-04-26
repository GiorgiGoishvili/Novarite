# Platform Message Schemas

Status: Draft  
Date: 2026-04-26

This document describes the planned signed message formats for Novarite.

Novarite is an indie game platform where developers can publish games, players can buy access passes, and communities can receive rewards using Solana-based ownership tools.

Replay protection comes from:

- an immutable `message_domain` derived from the Novarite program id and environment
- the signed developer wallet
- the signed player wallet
- the signed game id
- a unique nonce
- an expiration timestamp

Developer profiles, game listings, access passes, and reward claims should be unique for each deployment.

---

## `novarite-dev-v1`

`novarite-dev-v1` is the developer profile registration message.

Used by:

- `register_developer`
- `update_developer_profile`

### Fixed Header

| Offset | Size | Field |
|---|---:|---|
| 0 | 1 | `message_kind = 0x01` |
| 1 | 1 | `version = 0x01` |
| 2 | 16 | `message_domain` |
| 18 | 8 | `nonce` |

### Dynamic Body

After the fixed header, fields are encoded in this order:

1. `developer_wallet` as 32 raw bytes
2. `developer_name` as UTF-8 string
3. `studio_name` as UTF-8 string
4. `profile_uri` as UTF-8 string
5. `expires_at` as unix timestamp

### Validation Rules

- The signer must match `developer_wallet`.
- `message_domain` must match the active Novarite configuration.
- `nonce` must not be reused.
- `developer_name` cannot be empty.
- `profile_uri` should point to public developer metadata.

---

## `novarite-game-v1`

`novarite-game-v1` is the game listing publication message.

Used by:

- `publish_game`
- `update_game_listing`

### Fixed Header

| Offset | Size | Field |
|---|---:|---|
| 0 | 1 | `message_kind = 0x02` |
| 1 | 1 | `version = 0x01` |
| 2 | 16 | `message_domain` |
| 18 | 8 | `game_id` |
| 26 | 8 | `nonce` |

### Dynamic Body

After the fixed header, fields are encoded in this order:

1. `developer_wallet` as 32 raw bytes
2. `game_title` as UTF-8 string
3. `game_metadata_uri` as UTF-8 string
4. `cover_image_uri` as UTF-8 string
5. `price_lamports` as `u64`
6. `royalty_bps` as `u16`
7. `expires_at` as unix timestamp

### Validation Rules

- The signer must match the developer wallet.
- `game_id` must be unique.
- `game_title` cannot be empty.
- `price_lamports` must be greater than or equal to zero.
- `royalty_bps` must be between `0` and `10000`.
- Metadata URIs should be permanent or content-addressed where possible.

---

## `novarite-pass-v1`

`novarite-pass-v1` is the game access pass purchase message.

Used by:

- `buy_access_pass`
- `verify_game_ownership`

### Fixed Header

| Offset | Size | Field |
|---|---:|---|
| 0 | 1 | `message_kind = 0x03` |
| 1 | 1 | `version = 0x01` |
| 2 | 16 | `message_domain` |
| 18 | 8 | `game_id` |
| 26 | 8 | `nonce` |

### Dynamic Body

After the fixed header, fields are encoded in this order:

1. `buyer_wallet` as 32 raw bytes
2. `developer_wallet` as 32 raw bytes
3. `price_lamports` as `u64`
4. `platform_fee_bps` as `u16`
5. `expires_at` as unix timestamp

### Validation Rules

- The signer must match `buyer_wallet`.
- `game_id` must exist.
- `price_lamports` must match the active game listing.
- One buyer should not receive duplicate access passes for the same game.
- Platform fee must not exceed the configured maximum.

---

## Notes

These schemas are draft-level and may change during development.

The MVP will first focus on:

- developer profiles
- game listings
- access passes
- player rewards
