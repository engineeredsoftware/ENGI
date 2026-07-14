// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BitcodeERC1155
 * @notice Single multi-token contract for Bitcode settlement:
 *         - token id 0 = fungible BTD (Bitcode), max supply 21_000_000 * 10^18
 *         - token ids ≥ 1 = AssetPack co-ownership units (add-only; never burned)
 *
 * Settlement is one AssetPack per settle-asset-pack-pipeline run:
 *   1. settle-btc   — BTC-testnet payment finality (off-chain / oracle)
 *   2. mint-btd     — mint BTD to master from needinesses-weighted scalar
 *   3. settle-btd   — transfer BTD master → buyer
 *   4. settle-asset-pack — add buyer as equal co-owner (depositor retains)
 *
 * BTD mint amount is NOT computed on-chain from measurements; the operator
 * (or trusted settlement executor) supplies the needinesses-derived amount
 * after off-chain measurement + BTC finality. On-chain enforces supply cap,
 * master mint destination, and add-only AssetPack co-ownership.
 *
 * This contract is intentionally self-contained (no OpenZeppelin dependency)
 * so the monorepo can version the law without a Solidity toolchain package.
 * Deploy with solc 0.8.20+; behavior is mirrored in packages/btd/src/erc1155.
 */

contract BitcodeERC1155 {
    // --- constants ---
    uint256 public constant BTD_TOKEN_ID = 0;
    uint256 public constant BTD_DECIMALS = 18;
    uint256 public constant BTD_MAX_WHOLE = 21_000_000;
    uint256 public constant BTD_MAX_SUPPLY = BTD_MAX_WHOLE * (10 ** BTD_DECIMALS);

    string public name;
    string public symbol;

    address public owner;
    address public masterAccount;
    address public settlementOperator;

    uint256 public btdTotalMinted;
    uint256 public nextAssetPackTokenId = 1;
    uint256 public settlementSequence;

    // balances[account][id]
    mapping(address => mapping(uint256 => uint256)) private _balances;

    // AssetPack registry
    mapping(bytes32 => uint256) public assetPackTokenByKey;
    mapping(uint256 => bytes32) public assetPackKeyByToken;
    mapping(uint256 => address[]) private _coOwners;
    mapping(uint256 => mapping(address => bool)) public isCoOwner;
    mapping(uint256 => string) public assetPackMetadataRoot;

    // --- events ---
    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );
    event BtdMinted(
        address indexed to,
        uint256 amount,
        bytes32 indexed assetPackKey,
        uint256 needFitMicro,
        uint256 settlementSequence
    );
    event BtdSettledToBuyer(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 indexed assetPackKey,
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

    error NotOwner();
    error NotOperator();
    error ZeroAddress();
    error ZeroAmount();
    error SupplyExceeded();
    error InsufficientBalance();
    error AssetPackMissing();
    error BurnForbidden();
    error AlreadyCoOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOperator() {
        if (msg.sender != settlementOperator && msg.sender != owner) revert NotOperator();
        _;
    }

    constructor(address masterAccount_, address settlementOperator_, string memory name_, string memory symbol_) {
        if (masterAccount_ == address(0) || settlementOperator_ == address(0)) revert ZeroAddress();
        owner = msg.sender;
        masterAccount = masterAccount_;
        settlementOperator = settlementOperator_;
        name = name_;
        symbol = symbol_;
    }

    function setMasterAccount(address masterAccount_) external onlyOwner {
        if (masterAccount_ == address(0)) revert ZeroAddress();
        masterAccount = masterAccount_;
    }

    function setSettlementOperator(address settlementOperator_) external onlyOwner {
        if (settlementOperator_ == address(0)) revert ZeroAddress();
        settlementOperator = settlementOperator_;
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        return _balances[account][id];
    }

    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory) {
        require(accounts.length == ids.length, "length mismatch");
        uint256[] memory batch = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            batch[i] = _balances[accounts[i]][ids[i]];
        }
        return batch;
    }

    function coOwnersOf(uint256 tokenId) external view returns (address[] memory) {
        return _coOwners[tokenId];
    }

    function coOwnerCount(uint256 tokenId) external view returns (uint256) {
        return _coOwners[tokenId].length;
    }

    /**
     * @notice mint-btd: mint fungible BTD to master after BTC settlement.
     * @param amount base units (18 decimals), from off-chain needinesses weighting
     * @param assetPackKey hash key of the settled AssetPack
     * @param needFitMicro need-fit volume * 1e6 (for receipt; not used for math on-chain)
     */
    function mintBtdToMaster(
        uint256 amount,
        bytes32 assetPackKey,
        uint256 needFitMicro
    ) external onlyOperator returns (uint256 seq) {
        if (amount == 0) revert ZeroAmount();
        if (btdTotalMinted + amount > BTD_MAX_SUPPLY) revert SupplyExceeded();

        btdTotalMinted += amount;
        _balances[masterAccount][BTD_TOKEN_ID] += amount;
        seq = ++settlementSequence;

        emit TransferSingle(msg.sender, address(0), masterAccount, BTD_TOKEN_ID, amount);
        emit BtdMinted(masterAccount, amount, assetPackKey, needFitMicro, seq);
    }

    /**
     * @notice settle-btd: transfer BTD from master to buyer.
     */
    function settleBtdToBuyer(
        address buyer,
        uint256 amount,
        bytes32 assetPackKey
    ) external onlyOperator returns (uint256 seq) {
        if (buyer == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 masterBal = _balances[masterAccount][BTD_TOKEN_ID];
        if (masterBal < amount) revert InsufficientBalance();

        _balances[masterAccount][BTD_TOKEN_ID] = masterBal - amount;
        _balances[buyer][BTD_TOKEN_ID] += amount;
        seq = ++settlementSequence;

        emit TransferSingle(msg.sender, masterAccount, buyer, BTD_TOKEN_ID, amount);
        emit BtdSettledToBuyer(masterAccount, buyer, amount, assetPackKey, seq);
    }

    /**
     * @notice Register a new AssetPack with depositor as initial co-owner.
     *         Idempotent on assetPackKey.
     */
    function registerAssetPack(
        bytes32 assetPackKey,
        address depositor,
        string calldata metadataRoot
    ) external onlyOperator returns (uint256 tokenId) {
        if (depositor == address(0)) revert ZeroAddress();
        uint256 existing = assetPackTokenByKey[assetPackKey];
        if (existing != 0) return existing;

        tokenId = nextAssetPackTokenId++;
        assetPackTokenByKey[assetPackKey] = tokenId;
        assetPackKeyByToken[tokenId] = assetPackKey;
        assetPackMetadataRoot[tokenId] = metadataRoot;

        _coOwners[tokenId].push(depositor);
        isCoOwner[tokenId][depositor] = true;
        _balances[depositor][tokenId] = 1;

        emit TransferSingle(msg.sender, address(0), depositor, tokenId, 1);
        emit AssetPackRegistered(tokenId, assetPackKey, depositor, metadataRoot);
    }

    /**
     * @notice settle-asset-pack: add buyer as equal co-owner. Never removes prior owners.
     *         AssetPack ownership cannot be burned.
     */
    function addAssetPackCoOwner(
        bytes32 assetPackKey,
        address buyer
    ) external onlyOperator returns (uint256 tokenId, uint256 seq) {
        if (buyer == address(0)) revert ZeroAddress();
        tokenId = assetPackTokenByKey[assetPackKey];
        if (tokenId == 0) revert AssetPackMissing();
        if (isCoOwner[tokenId][buyer]) {
            // Idempotent: already co-owner — still emit sequence for settle journal.
            seq = ++settlementSequence;
            emit AssetPackCoOwnerAdded(tokenId, assetPackKey, buyer, _coOwners[tokenId].length, seq);
            return (tokenId, seq);
        }

        isCoOwner[tokenId][buyer] = true;
        _coOwners[tokenId].push(buyer);
        // Add-only: mint +1 co-ownership unit; never decrement prior owners.
        _balances[buyer][tokenId] += 1;
        seq = ++settlementSequence;

        emit TransferSingle(msg.sender, address(0), buyer, tokenId, 1);
        emit AssetPackCoOwnerAdded(tokenId, assetPackKey, buyer, _coOwners[tokenId].length, seq);
    }

    /**
     * @notice AssetPack co-ownership is permanent — burn is forbidden.
     */
    function burnAssetPack(uint256 /*tokenId*/, address /*account*/, uint256 /*amount*/) external pure {
        revert BurnForbidden();
    }

    /**
     * @dev Safe transfer for fungible BTD only (token id 0). AssetPack units are
     *      not transferable via this path in V48 (co-ownership is operator-mediated).
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata /*data*/
    ) external {
        if (msg.sender != from && msg.sender != settlementOperator && msg.sender != owner) {
            revert NotOperator();
        }
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        // AssetPack NFT co-ownership is not freely transferable in V48.
        require(id == BTD_TOKEN_ID, "only BTD transferable");
        uint256 fromBal = _balances[from][id];
        if (fromBal < amount) revert InsufficientBalance();
        _balances[from][id] = fromBal - amount;
        _balances[to][id] += amount;
        emit TransferSingle(msg.sender, from, to, id, amount);
    }
}
