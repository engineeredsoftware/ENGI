// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BitcodeERC1155} from "../src/BitcodeERC1155.sol";

/**
 * @notice Deploy BitcodeERC1155 to Sepolia (or any RPC).
 *
 * Required env (export before forge script):
 *   BITCODE_DEPLOYER_PRIVATE_KEY — deployer key (0x…); pays gas
 *   BITCODE_MASTER_ACCOUNT       — payable treasury
 *   BITCODE_SETTLEMENT_OPERATOR  — quote signer address on-chain
 *   BITCODE_PAYMENT_ATTESTOR    — optional; defaults to operator
 *   BITCODE_COIN_FEE_BPS         — optional; default 250
 *   BITCODE_ETHEREUM_RPC_URL     — Sepolia RPC (--rpc-url)
 *
 * Example:
 *   cd packages/btd/contracts
 *   forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
 *     --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
 *     --broadcast \
 *     --verify
 */
contract DeployBitcodeERC1155 is Script {
    function run() external returns (BitcodeERC1155 deployed) {
        address master = vm.envAddress("BITCODE_MASTER_ACCOUNT");
        address operator = vm.envAddress("BITCODE_SETTLEMENT_OPERATOR");
        address attestor = vm.envOr("BITCODE_PAYMENT_ATTESTOR", operator);
        uint256 feeBps = vm.envOr("BITCODE_COIN_FEE_BPS", uint256(250));
        require(feeBps <= 5_000, "coinFeeBps too high");

        uint256 deployerKey = vm.envUint("BITCODE_DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console2.log("Deployer:", deployer);
        console2.log("Master:  ", master);
        console2.log("Operator:", operator);
        console2.log("Attestor:", attestor);
        console2.log("Fee bps: ", feeBps);

        vm.startBroadcast(deployerKey);
        // casting to uint16 is safe: feeBps checked <= 5000 above
        // forge-lint: disable-next-line(unsafe-typecast)
        deployed = new BitcodeERC1155(
            payable(master),
            operator,
            attestor,
            uint16(feeBps),
            "Bitcode",
            "BTD"
        );
        vm.stopBroadcast();

        console2.log("BitcodeERC1155:", address(deployed));
        console2.log("Set app env: BITCODE_ERC1155_ADDRESS=%s", address(deployed));
    }
}
