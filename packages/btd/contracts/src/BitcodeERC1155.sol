// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BitcodeERC1155
 * @author Bitcode
 * @notice Commercial settlement multi-token on Ethereum (testnet → mainnet later).
 *
 * TOKEN LAYOUT
 * - id 0  = BTD (fungible Bitcode). Lifetime max 21_000_000 whole tokens (18 decimals).
 *           Freely transferable so external spot/swap markets can list BTD.
 * - id ≥1 = AssetPack co-ownership NFT units. Add-only; burn forbidden; not freely transferable.
 *
 * ECONOMICS (product law)
 * - You NEVER pay in BTD. Buyers pay ETH (on-chain) or BTC/SOL (attested external rails).
 * - You ALWAYS earn BTD only via mint on settle (depositors who elect the BTD payout slice).
 * - BTD Volume V is derived OFF-CHAIN from needinesses fits only (absolutes never mint),
 *   then decayed for residual 21M scarcity; V is signed into the Quote.
 * - Depositor shares split each settle: btdBps (mint, 0 fee) + coinBps (external coin, fee).
 * - Unminted BTD (coin-chosen slice of V) is NOT issued — scarcity.
 *
 * PAY RAILS
 * - ETH: buyer calls settleReadWithEth{value: payAmount}(quote, sig).
 * - BTC / SOL: buyer pays on native rail; paymentAttestor signs proof; anyone/buyer calls
 *   settleReadWithExternalPay(quote, opSig, proof, payProofSig).
 *
 * TRUST
 * - settlementOperator signs EIP-712 Quotes (measurement, V, rates, shares).
 * - paymentAttestor signs that BTC/SOL payment for quoteId was observed (P1+).
 * - No server custody of user keys. Contract does not hold BTC/SOL native assets on Ethereum
 *   unless a future bridge deposit address is configured (out of band for V0 accounting).
 *
 * Dual-maintain: packages/btd/src/erc1155/* must mirror behavior for product receipts without solc.
 */

contract BitcodeERC1155 {
    // =========================================================================
    // CONSTANTS
    // =========================================================================

    /// @notice Fungible BTD token id inside this ERC1155.
    uint256 public constant BTD_TOKEN_ID = 0;

    /// @notice Decimals for BTD balances (ERC20-style display).
    uint256 public constant BTD_DECIMALS = 18;

    /// @notice Max whole BTD tokens ever mintable (hard cap narrative).
    uint256 public constant BTD_MAX_WHOLE = 21_000_000;

    /// @notice Max BTD in base units = 21_000_000 * 10^18.
    uint256 public constant BTD_MAX_SUPPLY = BTD_MAX_WHOLE * (10 ** BTD_DECIMALS);

    /// @notice EIP-712 typehash for Quote (field order must match off-chain signer).
    bytes32 public constant QUOTE_TYPEHASH = keccak256(
        "Quote(bytes32 assetPackKey,address buyer,uint8 payAsset,uint256 btdVolume,"
        "uint256 payAmount,uint256 rateMicro,uint256 needFitMicro,uint256 decayMicro,"
        "bytes32 sharesHash,string metadataRoot,uint256 deadline,bytes32 quoteId)"
    );

    /// @notice EIP-712 typehash for external (BTC/SOL) payment attestation.
    bytes32 public constant PAYMENT_PROOF_TYPEHASH = keccak256(
        "PaymentProof(bytes32 quoteId,uint8 payAsset,uint256 payAmount,address buyer,"
        "bytes32 railTxId,uint256 observedAt)"
    );

    // =========================================================================
    // ENUMS / STRUCTS
    // =========================================================================

    /// @notice Buyer payment asset. BTD is intentionally absent (cannot pay in BTD).
    enum PayAsset {
        ETH, // 0 — native msg.value on this chain
        BTC, // 1 — external rail; requires payment attestation
        SOL // 2 — external rail; requires payment attestation
    }

    /**
     * @notice One depositor's cut of a settle (source-to-shares row + payout preference).
     * @param depositor Earn recipient (must be non-zero).
     * @param weightBps Share of V / pay notional in basis points; all shares sum to 10_000.
     * @param btdBps Of this share: mint BTD (no protocol fee). btdBps + coinBps == 10_000.
     * @param coinBps Of this share: external coin leg (protocol fee applies).
     */
    struct SharePayout {
        address depositor;
        uint16 weightBps;
        uint16 btdBps;
        uint16 coinBps;
    }

    /**
     * @notice Operator-signed commercial quote for exactly one AssetPack settle.
     * @param assetPackKey Product identity key (bytes32) for the read AssetPack.
     * @param buyer Must equal msg.sender on ETH path; must match proof on external path.
     * @param payAsset ETH | BTC | SOL.
     * @param btdVolume V after needinesses + decay (max mintable notional this settle).
     * @param payAmount Exact units buyer must pay (wei / sats / lamports per asset).
     * @param rateMicro Spot payAsset per BTD audit field (1e6 micro scale).
     * @param needFitMicro needFitVolume * 1e6 audit (not used for math on-chain).
     * @param decayMicro decay * 1e6 audit.
     * @param shares Depositor splits; validated on-chain.
     * @param metadataRoot Source-safe metadata root string (never protected source body).
     * @param deadline unix seconds; reject if block.timestamp > deadline.
     * @param quoteId Unique id; single-use (replay protection).
     */
    struct Quote {
        bytes32 assetPackKey;
        address buyer;
        PayAsset payAsset;
        uint256 btdVolume;
        uint256 payAmount;
        uint256 rateMicro;
        uint256 needFitMicro;
        uint256 decayMicro;
        SharePayout[] shares;
        string metadataRoot;
        uint256 deadline;
        bytes32 quoteId;
    }

    /**
     * @notice Attestation that buyer paid payAmount of payAsset on external rail for quoteId.
     * @param railTxId BTC txid or SOL tx id as bytes32 hash of canonical id string.
     */
    struct PaymentProof {
        bytes32 quoteId;
        PayAsset payAsset;
        uint256 payAmount;
        address buyer;
        bytes32 railTxId;
        uint256 observedAt;
    }

    // =========================================================================
    // ERC1155-ish + ADMIN STATE
    // =========================================================================

    string public name;
    string public symbol;

    address public owner;
    /// @notice Protocol treasury: coin fees + residual external payment when depositors take BTD.
    address payable public masterAccount;
    /// @notice Signs Quotes (measurement + commercial params).
    address public settlementOperator;
    /// @notice Signs BTC/SOL PaymentProofs after rail observation.
    address public paymentAttestor;

    /// @notice Protocol fee on depositor COIN legs only (basis points, e.g. 250 = 2.5%).
    uint16 public coinFeeBps;

    /// @notice Lifetime BTD base units minted (monotonic).
    uint256 public btdTotalMinted;

    /// @notice Next AssetPack token id (starts at 1; 0 is BTD).
    uint256 public nextAssetPackTokenId;

    /// @notice Monotonic settlement counter for receipts / journals.
    uint256 public settlementSequence;

    /// @dev balances[account][tokenId] — ERC1155-style.
    mapping(address => mapping(uint256 => uint256)) private _balances;

    /// @dev ERC1155 operator approvals for BTD market transfers.
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // AssetPack registry
    mapping(bytes32 => uint256) public assetPackTokenByKey;
    mapping(uint256 => bytes32) public assetPackKeyByToken;
    mapping(uint256 => address[]) private _coOwners;
    mapping(uint256 => mapping(address => bool)) public isCoOwner;
    mapping(uint256 => string) public assetPackMetadataRoot;

    /// @notice quoteId => consumed (prevents double settle).
    mapping(bytes32 => bool) public quoteConsumed;

    /// @notice railTxId => used (prevents double-spend of same BTC/SOL tx across quotes).
    mapping(bytes32 => bool) public railTxUsed;

    // =========================================================================
    // EIP-712 DOMAIN
    // =========================================================================

    bytes32 private immutable _DOMAIN_SEPARATOR;
    uint256 private immutable _CACHED_CHAIN_ID;
    address private immutable _CACHED_THIS;

    // =========================================================================
    // EVENTS
    // =========================================================================

    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );

    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    event BtdEarned(
        address indexed depositor,
        uint256 amount,
        bytes32 indexed assetPackKey,
        uint256 needFitMicro,
        uint256 settlementSequence
    );

    event CoinPaid(
        address indexed depositor,
        PayAsset payAsset,
        uint256 netAmount,
        uint256 feeAmount,
        uint256 settlementSequence
    );

    event AssetPackRegistered(
        uint256 indexed tokenId,
        bytes32 indexed assetPackKey,
        address indexed depositor,
        string metadataRoot
    );

    event AssetPackCoOwnerAdded(
        uint256 indexed tokenId,
        bytes32 indexed assetPackKey,
        address indexed account,
        uint256 coOwnerCount,
        uint256 settlementSequence
    );

    event ReadSettled(
        bytes32 indexed quoteId,
        bytes32 indexed assetPackKey,
        address indexed buyer,
        PayAsset payAsset,
        uint256 payAmount,
        uint256 btdVolume,
        uint256 btdMintedTotal,
        uint256 apTokenId,
        uint256 settlementSequence
    );

    event MasterAccountUpdated(address indexed previous, address indexed current);
    event SettlementOperatorUpdated(address indexed previous, address indexed current);
    event PaymentAttestorUpdated(address indexed previous, address indexed current);
    event CoinFeeBpsUpdated(uint16 previous, uint16 current);

    // =========================================================================
    // ERRORS
    // =========================================================================

    error NotOwner();
    error NotOperator();
    error ZeroAddress();
    error ZeroAmount();
    error SupplyExceeded();
    error InsufficientBalance();
    error AssetPackMissing();
    error BurnForbidden();
    error QuoteExpired();
    error QuoteConsumed();
    error QuoteMismatch();
    error InvalidSignature();
    error InvalidShares();
    error InvalidPayAsset();
    error IncorrectPayment();
    error RailTxAlreadyUsed();
    error TransferFailed();
    error OnlyBtdTransferable();
    error ArrayLengthMismatch();
    error EthNotAccepted();

    // =========================================================================
    // MODIFIERS
    // =========================================================================

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @param masterAccount_ Protocol treasury (payable for ETH residuals/fees).
     * @param settlementOperator_ Quote signer.
     * @param paymentAttestor_ BTC/SOL payment proof signer (can equal operator on testnet).
     * @param coinFeeBps_ Fee on coin legs (on-chain max 5000 = 50%).
     * @param name_ Token collection name.
     * @param symbol_ Token symbol (BTD).
     */
    constructor(
        address payable masterAccount_,
        address settlementOperator_,
        address paymentAttestor_,
        uint16 coinFeeBps_,
        string memory name_,
        string memory symbol_
    ) {
        if (
            masterAccount_ == address(0) || settlementOperator_ == address(0)
                || paymentAttestor_ == address(0)
        ) {
            revert ZeroAddress();
        }
        if (coinFeeBps_ > 5_000) revert InvalidShares();

        owner = msg.sender;
        masterAccount = masterAccount_;
        settlementOperator = settlementOperator_;
        paymentAttestor = paymentAttestor_;
        coinFeeBps = coinFeeBps_;
        name = name_;
        symbol = symbol_;
        nextAssetPackTokenId = 1;

        _CACHED_CHAIN_ID = block.chainid;
        _CACHED_THIS = address(this);
        _DOMAIN_SEPARATOR = _buildDomainSeparator();
    }

    // =========================================================================
    // VIEWS
    // =========================================================================

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        return _balances[account][id];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external
        view
        returns (uint256[] memory batch)
    {
        if (accounts.length != ids.length) revert ArrayLengthMismatch();
        batch = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            batch[i] = _balances[accounts[i]][ids[i]];
        }
    }

    function isApprovedForAll(address account, address operator) public view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function coOwnersOf(uint256 tokenId) external view returns (address[] memory) {
        return _coOwners[tokenId];
    }

    function coOwnerCount(uint256 tokenId) external view returns (uint256) {
        return _coOwners[tokenId].length;
    }

    /// @notice Remaining base units that may still be minted under the 21M cap.
    function remainingMintable() public view returns (uint256) {
        return BTD_MAX_SUPPLY - btdTotalMinted;
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        if (block.chainid == _CACHED_CHAIN_ID && address(this) == _CACHED_THIS) {
            return _DOMAIN_SEPARATOR;
        }
        return _buildDomainSeparator();
    }

    // =========================================================================
    // ADMIN
    // =========================================================================

    function setMasterAccount(address payable masterAccount_) external onlyOwner {
        if (masterAccount_ == address(0)) revert ZeroAddress();
        emit MasterAccountUpdated(masterAccount, masterAccount_);
        masterAccount = masterAccount_;
    }

    function setSettlementOperator(address settlementOperator_) external onlyOwner {
        if (settlementOperator_ == address(0)) revert ZeroAddress();
        emit SettlementOperatorUpdated(settlementOperator, settlementOperator_);
        settlementOperator = settlementOperator_;
    }

    function setPaymentAttestor(address paymentAttestor_) external onlyOwner {
        if (paymentAttestor_ == address(0)) revert ZeroAddress();
        emit PaymentAttestorUpdated(paymentAttestor, paymentAttestor_);
        paymentAttestor = paymentAttestor_;
    }

    function setCoinFeeBps(uint16 coinFeeBps_) external onlyOwner {
        if (coinFeeBps_ > 5_000) revert InvalidShares();
        emit CoinFeeBpsUpdated(coinFeeBps, coinFeeBps_);
        coinFeeBps = coinFeeBps_;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    // =========================================================================
    // ASSETPACK REGISTRY (no BTD mint)
    // =========================================================================

    /**
     * @notice Register depositor as first co-owner of an AssetPack NFT id.
     * @dev Idempotent on assetPackKey. Does not mint BTD.
     */
    function registerAssetPack(bytes32 assetPackKey, address depositor, string calldata metadataRoot)
        external
        returns (uint256 tokenId)
    {
        if (msg.sender != settlementOperator && msg.sender != owner) revert NotOperator();
        tokenId = _registerAssetPack(assetPackKey, depositor, metadataRoot);
    }

    function _registerAssetPack(bytes32 assetPackKey, address depositor, string memory metadataRoot)
        internal
        returns (uint256 tokenId)
    {
        if (depositor == address(0)) revert ZeroAddress();
        if (assetPackKey == bytes32(0)) revert InvalidShares();

        uint256 existing = assetPackTokenByKey[assetPackKey];
        if (existing != 0) {
            return existing;
        }

        tokenId = nextAssetPackTokenId;
        unchecked {
            nextAssetPackTokenId = tokenId + 1;
        }

        assetPackTokenByKey[assetPackKey] = tokenId;
        assetPackKeyByToken[tokenId] = assetPackKey;
        assetPackMetadataRoot[tokenId] = metadataRoot;

        _coOwners[tokenId].push(depositor);
        isCoOwner[tokenId][depositor] = true;
        _balances[depositor][tokenId] = 1;

        emit TransferSingle(msg.sender, address(0), depositor, tokenId, 1);
        emit AssetPackRegistered(tokenId, assetPackKey, depositor, metadataRoot);
    }

    // =========================================================================
    // SETTLE — ETH (atomic pay + mint + co-own)
    // =========================================================================

    /**
     * @notice Buyer settles one AssetPack paying exact ETH (wei) == quote.payAmount.
     */
    function settleReadWithEth(Quote calldata quote, bytes calldata opSig)
        external
        payable
        returns (uint256 seq, uint256 apTokenId)
    {
        if (quote.payAsset != PayAsset.ETH) revert InvalidPayAsset();
        if (msg.value != quote.payAmount) revert IncorrectPayment();
        if (quote.buyer != msg.sender) revert QuoteMismatch();

        _assertQuoteSignature(quote, opSig);
        (seq, apTokenId) = _finalizeSettle(quote);
    }

    // =========================================================================
    // SETTLE — BTC / SOL (attested external payment)
    // =========================================================================

    /**
     * @notice Finalize settle after BTC or SOL payment was observed off-chain.
     * @dev Does not custody BTC/SOL on this contract; emits CoinPaid for rail executors.
     *      BTD mint + AP co-own happen on-chain here.
     */
    function settleReadWithExternalPay(
        Quote calldata quote,
        bytes calldata opSig,
        PaymentProof calldata proof,
        bytes calldata payProofSig
    ) external returns (uint256 seq, uint256 apTokenId) {
        if (quote.payAsset != PayAsset.BTC && quote.payAsset != PayAsset.SOL) {
            revert InvalidPayAsset();
        }
        if (proof.quoteId != quote.quoteId) revert QuoteMismatch();
        if (proof.payAsset != quote.payAsset) revert QuoteMismatch();
        if (proof.payAmount != quote.payAmount) revert IncorrectPayment();
        if (proof.buyer != quote.buyer) revert QuoteMismatch();
        if (proof.railTxId == bytes32(0)) revert ZeroAmount();
        if (railTxUsed[proof.railTxId]) revert RailTxAlreadyUsed();

        _assertQuoteSignature(quote, opSig);
        _assertPaymentProofSignature(proof, payProofSig);

        // CEI: mark rail tx consumed before external interactions in finalize.
        railTxUsed[proof.railTxId] = true;

        (seq, apTokenId) = _finalizeSettle(quote);
    }

    // =========================================================================
    // FINALIZE (shared)
    // =========================================================================

    /**
     * @dev Core settle: validate shares, mint BTD slices, split ETH coin legs, co-own buyer.
     */
    function _finalizeSettle(Quote calldata quote)
        internal
        returns (uint256 seq, uint256 apTokenId)
    {
        if (block.timestamp > quote.deadline) revert QuoteExpired();
        if (quoteConsumed[quote.quoteId]) revert QuoteConsumed();
        if (quote.btdVolume == 0 || quote.payAmount == 0) revert ZeroAmount();
        if (quote.assetPackKey == bytes32(0)) revert InvalidShares();
        if (quote.buyer == address(0)) revert ZeroAddress();

        // Cap: even if all BTD elected, cannot exceed remaining supply.
        if (btdTotalMinted + quote.btdVolume > BTD_MAX_SUPPLY) revert SupplyExceeded();

        _validateShares(quote.shares);

        quoteConsumed[quote.quoteId] = true;
        unchecked {
            seq = ++settlementSequence;
        }

        uint256 totalMinted = 0;
        uint256 ethDistributed = 0;
        uint256 shareLen = quote.shares.length;

        for (uint256 i = 0; i < shareLen; i++) {
            SharePayout calldata s = quote.shares[i];

            uint256 shareNotional = (quote.btdVolume * uint256(s.weightBps)) / 10_000;
            uint256 mint_i = (shareNotional * uint256(s.btdBps)) / 10_000;
            uint256 coinWeightBps = (uint256(s.weightBps) * uint256(s.coinBps)) / 10_000;

            if (mint_i > 0) {
                totalMinted += mint_i;
                _balances[s.depositor][BTD_TOKEN_ID] += mint_i;
                emit TransferSingle(msg.sender, address(0), s.depositor, BTD_TOKEN_ID, mint_i);
                emit BtdEarned(s.depositor, mint_i, quote.assetPackKey, quote.needFitMicro, seq);
            }

            if (coinWeightBps > 0) {
                uint256 coinGross = (quote.payAmount * coinWeightBps) / 10_000;
                uint256 fee = (coinGross * uint256(coinFeeBps)) / 10_000;
                uint256 coinNet = coinGross - fee;

                if (quote.payAsset == PayAsset.ETH) {
                    if (coinNet > 0) {
                        _sendEth(s.depositor, coinNet);
                    }
                    // Gross includes fee retained on contract until dust sweep.
                    ethDistributed += coinGross;
                }
                // BTC/SOL: emit intent; ops/bridge fulfill off-chain.
                emit CoinPaid(s.depositor, quote.payAsset, coinNet, fee, seq);
            }
        }

        // Actual mint may be < btdVolume when depositors choose coin legs.
        if (totalMinted > quote.btdVolume) revert SupplyExceeded();
        btdTotalMinted += totalMinted;

        if (quote.payAsset == PayAsset.ETH) {
            // Residual (BTD-elected portions of pay) + retained fees → master.
            // After coin nets are sent, remaining balance is residual + fees.
            uint256 remaining = address(this).balance;
            if (remaining > 0) {
                _sendEth(masterAccount, remaining);
            }
            // Silence unused local in optimized builds when all ETH went out.
            ethDistributed;
        }

        // AssetPack co-own: primary depositor = shares[0] (off-chain: highest weight first).
        address primaryDepositor = quote.shares[0].depositor;
        apTokenId = assetPackTokenByKey[quote.assetPackKey];
        if (apTokenId == 0) {
            apTokenId = _registerAssetPack(quote.assetPackKey, primaryDepositor, quote.metadataRoot);
        }
        _addCoOwner(apTokenId, quote.assetPackKey, quote.buyer, seq);

        emit ReadSettled(
            quote.quoteId,
            quote.assetPackKey,
            quote.buyer,
            quote.payAsset,
            quote.payAmount,
            quote.btdVolume,
            totalMinted,
            apTokenId,
            seq
        );
    }

    function _addCoOwner(uint256 tokenId, bytes32 assetPackKey, address account, uint256 seq)
        internal
    {
        if (account == address(0)) revert ZeroAddress();
        if (tokenId == 0) revert AssetPackMissing();

        if (isCoOwner[tokenId][account]) {
            emit AssetPackCoOwnerAdded(
                tokenId, assetPackKey, account, _coOwners[tokenId].length, seq
            );
            return;
        }

        isCoOwner[tokenId][account] = true;
        _coOwners[tokenId].push(account);
        _balances[account][tokenId] += 1;

        emit TransferSingle(msg.sender, address(0), account, tokenId, 1);
        emit AssetPackCoOwnerAdded(tokenId, assetPackKey, account, _coOwners[tokenId].length, seq);
    }

    function _validateShares(SharePayout[] calldata shares) internal pure {
        uint256 n = shares.length;
        if (n == 0) revert InvalidShares();

        uint256 weightSum = 0;
        for (uint256 i = 0; i < n; i++) {
            SharePayout calldata s = shares[i];
            if (s.depositor == address(0)) revert ZeroAddress();
            if (uint256(s.btdBps) + uint256(s.coinBps) != 10_000) revert InvalidShares();
            if (s.weightBps == 0) revert InvalidShares();
            weightSum += s.weightBps;
        }
        if (weightSum != 10_000) revert InvalidShares();
    }

    function _sendEth(address to, uint256 amount) internal {
        (bool ok,) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    // =========================================================================
    // EIP-712 SIGNATURE CHECKS
    // =========================================================================

    function _assertQuoteSignature(Quote calldata quote, bytes calldata opSig) internal view {
        bytes32 sharesHash = _hashShares(quote.shares);
        bytes32 structHash = keccak256(
            abi.encode(
                QUOTE_TYPEHASH,
                quote.assetPackKey,
                quote.buyer,
                uint8(quote.payAsset),
                quote.btdVolume,
                quote.payAmount,
                quote.rateMicro,
                quote.needFitMicro,
                quote.decayMicro,
                sharesHash,
                keccak256(bytes(quote.metadataRoot)),
                quote.deadline,
                quote.quoteId
            )
        );
        address recovered = _recover(structHash, opSig);
        if (recovered != settlementOperator) revert InvalidSignature();
    }

    function _assertPaymentProofSignature(PaymentProof calldata proof, bytes calldata payProofSig)
        internal
        view
    {
        bytes32 structHash = keccak256(
            abi.encode(
                PAYMENT_PROOF_TYPEHASH,
                proof.quoteId,
                uint8(proof.payAsset),
                proof.payAmount,
                proof.buyer,
                proof.railTxId,
                proof.observedAt
            )
        );
        address recovered = _recover(structHash, payProofSig);
        if (recovered != paymentAttestor) revert InvalidSignature();
    }

    function _hashShares(SharePayout[] calldata shares) internal pure returns (bytes32) {
        bytes32[] memory hashes = new bytes32[](shares.length);
        for (uint256 i = 0; i < shares.length; i++) {
            hashes[i] = keccak256(
                abi.encode(
                    shares[i].depositor, shares[i].weightBps, shares[i].btdBps, shares[i].coinBps
                )
            );
        }
        return keccak256(abi.encodePacked(hashes));
    }

    function _recover(bytes32 structHash, bytes calldata signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), structHash));
        if (signature.length != 65) revert InvalidSignature();
        bytes32 r;
        bytes32 s;
        uint8 v;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (v < 27) v += 27;
        address recovered = ecrecover(digest, v, r, s);
        if (recovered == address(0)) revert InvalidSignature();
        return recovered;
    }

    function _buildDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // =========================================================================
    // ERC1155 TRANSFERS — BTD only (markets); AP locked
    // =========================================================================

    function setApprovalForAll(address operator, bool approved) external {
        if (operator == address(0)) revert ZeroAddress();
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @notice Transfer fungible BTD only. AssetPack ids cannot be freely transferred.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata /* data */
    ) external {
        _transferBtd(msg.sender, from, to, id, amount);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata /* data */
    ) external {
        if (ids.length != amounts.length) revert ArrayLengthMismatch();
        // Preserve original msg.sender for approval checks (no external this. call).
        address operator = msg.sender;
        for (uint256 i = 0; i < ids.length; i++) {
            _transferBtd(operator, from, to, ids[i], amounts[i]);
        }
    }

    function _transferBtd(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) internal {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (id != BTD_TOKEN_ID) revert OnlyBtdTransferable();
        if (operator != from && !_operatorApprovals[from][operator]) revert NotOperator();

        uint256 fromBal = _balances[from][id];
        if (fromBal < amount) revert InsufficientBalance();
        unchecked {
            _balances[from][id] = fromBal - amount;
            _balances[to][id] += amount;
        }
        emit TransferSingle(operator, from, to, id, amount);
    }

    /// @notice AssetPack burn is permanently forbidden.
    function burnAssetPack(uint256, address, uint256) external pure {
        revert BurnForbidden();
    }

    // =========================================================================
    // ETH GUARDS
    // =========================================================================

    /// @dev Reject bare ETH transfers; payment must go through settleReadWithEth.
    receive() external payable {
        revert EthNotAccepted();
    }

    fallback() external payable {
        revert EthNotAccepted();
    }
}
