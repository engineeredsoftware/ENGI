# Bitcode V27 Crypto Research Rebinding

Status: V27 promotion support note. Canonical protocol law remains in `BITCODE_SPEC_V27.md`, `BITCODE_SPEC_V27_DELTA.md`, and `BITCODE_SPEC_V27_PARITY_MATRIX.md`.

Date: 2026-05-06.

## Bound Normative Choices

- Bitcoin validation is the model for V27 cap/finality posture: Bitcode must validate against its own fixed `$BTD` cap and reject over-issuance rather than relying on UI or indexer trust. Source: https://bitcoin.org/en/bitcoin-core/features/validation
- BTC fee transactions use a PSBT-style user-controlled signing lifecycle rather than server custody. Source: BIP 174, https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
- Bitcoin AssetPack anchoring prefers Taproot commitments for the V27 Bitcoin lane. Source: BIP 341, https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
- Signet/regtest remain proof and local lanes; value-bearing mainnet is configuration-ready but requires separate operational approval.
- Measureminting decay is Bitcode-native and is informed by utility-tied issuance research, not copied as time-based mining. Source: Filecoin minting model, https://spec.filecoin.io/systems/filecoin_token/minting_model/
- Ethereum remains secondary or optional for V27. ERC-721, ERC-2309, ERC-4907, and EIP-712 are design references for uniqueness, consecutive range events, owner/user separation, and signed intents; they are not Bitcode issuance law. Sources:
  - https://eips.ethereum.org/EIPS/eip-721
  - https://eips.ethereum.org/EIPS/eip-2309
  - https://eips.ethereum.org/EIPS/eip-4907
  - https://eips.ethereum.org/EIPS/eip-712
- Bitcode settlement must not depend on passive third-party royalty signaling. Recurring economics stay inside licensed reads, Exchange settlement, rights-transfer receipts, and ledger/database reconciliation.

## Library Optionality

V27 does not freeze production library installation as protocol law. The current research supports these implementation preferences when live adapters are added:

- OpenZeppelin Contracts are suitable candidates for any later Ethereum registry/event contract primitives because the official docs describe modular reusable Solidity contracts and token-standard implementations. Source: https://docs.openzeppelin.com/contracts
- Foundry is the preferred Ethereum contract build/test harness candidate because the official docs present it as a Rust-based build, test, debug, deploy, and verification toolkit. Source: https://www.getfoundry.sh/
- viem is the preferred low-level TypeScript Ethereum client candidate because the official docs emphasize stateless primitives, type safety, and transport/client separation. Source: https://viem.sh/docs/getting-started
- wagmi is the preferred React wallet/hook candidate for Ethereum-adjacent UI if that surface becomes active, because official docs bind it to viem and React hooks. Source: https://wagmi.sh/react/getting-started

These are candidates, not hard protocol dependencies. V27 source keeps Bitcoin fee signing, AssetPack anchor receipts, Exchange rights transfers, Terminal journals, reconciliation, telemetry, and upgrade receipts behind Bitcode package/API boundaries so future adapter changes do not alter protocol law.

## Implementation Implications

- API routes remain unversioned and in-place under `/api/btd/*`.
- Wallet sessions must fail closed without address authorization proof.
- BTC fee receipts must stay BTC-only.
- AssetPack anchors must bind AssetPack id, range, source manifest root, proof root, access policy hash, ledger transaction id/hash, and finality.
- Ethereum registry/event anchors must be explicit and secondary; no Ethereum route may imply ERC-20-like `$BTD` fungibility.
- Signed orders and intents require nonces/deadlines/domain separation because EIP-712 itself does not supply replay protection.
- UI product surfaces must describe Terminal Read minting and minimal Exchange range transfer as V27, while reserving broader market depth for later work.
