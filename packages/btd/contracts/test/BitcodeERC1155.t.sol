// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BitcodeERC1155} from "../src/BitcodeERC1155.sol";

/**
 * @notice Smoke + constructor / view tests. Full settle EIP-712 coverage can
 *         expand once quote hashing helpers are shared with the TS dual-maintain.
 */
contract BitcodeERC1155Test is Test {
    BitcodeERC1155 internal token;
    address payable internal master = payable(address(0xA11CE));
    address internal operator = address(0xB0B);
    address internal attestor = address(0xC0DE);
    address internal depositor = address(0xD00D);
    address internal buyer = address(0xBEEF);

    function setUp() public {
        token = new BitcodeERC1155(master, operator, attestor, 250, "Bitcode", "BTD");
    }

    function test_constants() public view {
        assertEq(token.BTD_TOKEN_ID(), 0);
        assertEq(token.BTD_MAX_WHOLE(), 21_000_000);
        assertEq(token.BTD_DECIMALS(), 18);
        assertEq(token.btdTotalMinted(), 0);
        assertEq(token.nextAssetPackTokenId(), 1);
        assertEq(token.coinFeeBps(), 250);
        assertEq(token.masterAccount(), master);
        assertEq(token.settlementOperator(), operator);
        assertEq(token.paymentAttestor(), attestor);
    }

    function test_registerAssetPack_operator() public {
        bytes32 key = keccak256("pack-1");
        vm.prank(operator);
        uint256 id = token.registerAssetPack(key, depositor, "meta:root");
        assertEq(id, 1);
        assertEq(token.assetPackTokenByKey(key), 1);
        assertEq(token.balanceOf(depositor, id), 1);
        assertTrue(token.isCoOwner(id, depositor));
        assertEq(token.coOwnerCount(id), 1);
    }

    function test_registerAssetPack_idempotent() public {
        bytes32 key = keccak256("pack-2");
        vm.startPrank(operator);
        uint256 a = token.registerAssetPack(key, depositor, "m1");
        uint256 b = token.registerAssetPack(key, depositor, "m2");
        vm.stopPrank();
        assertEq(a, b);
        assertEq(token.nextAssetPackTokenId(), 2);
    }

    function test_registerAssetPack_revertsNonOperator() public {
        bytes32 key = keccak256("pack-x");
        vm.prank(buyer);
        vm.expectRevert(BitcodeERC1155.NotOperator.selector);
        token.registerAssetPack(key, depositor, "m");
    }

    function test_burnAssetPack_forbidden() public {
        vm.expectRevert(BitcodeERC1155.BurnForbidden.selector);
        token.burnAssetPack(1, depositor, 1);
    }

    function test_remainingMintable() public view {
        assertEq(token.remainingMintable(), token.BTD_MAX_SUPPLY());
    }

    function test_rejectBareEth() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(BitcodeERC1155.EthNotAccepted.selector);
        (bool ok,) = address(token).call{value: 0.1 ether}("");
        ok; // silence
    }

    function test_btdTransfer_afterManualBalance() public {
        // Operator registers pack only; BTD mint is settle-path. Simulate mint via
        // settle is out of scope here — transfer reverts with zero balance.
        vm.prank(buyer);
        vm.expectRevert(BitcodeERC1155.InsufficientBalance.selector);
        token.safeTransferFrom(buyer, depositor, 0, 1, "");
    }
}
