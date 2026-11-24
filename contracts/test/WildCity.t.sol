// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {WildCityCatalogNFT} from "../WildCityCatalogNFT.sol";
import {WildCityProperty} from "../WildCityProperty.sol";
import {WildCityVehicle} from "../WildCityVehicle.sol";
import {WildCityOutfit} from "../WildCityOutfit.sol";
import {WildCityMarketplace} from "../WildCityMarketplace.sol";
import {WildCityLeaderboard} from "../WildCityLeaderboard.sol";

/// @dev 6-decimal stand-in for USDC.
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract WildCityTest is Test {
    MockUSDC usdc;
    WildCityProperty property;
    WildCityVehicle vehicle;
    WildCityOutfit outfit;
    WildCityMarketplace market;
    WildCityLeaderboard board;

    address owner = makeAddr("owner");
    address ada = makeAddr("ada");
    address tunde = makeAddr("tunde");

    function setUp() public {
        vm.warp(1_700_000_000);
        usdc = new MockUSDC();
        property = new WildCityProperty(address(usdc), owner);
        vehicle = new WildCityVehicle(address(usdc), owner);
        outfit = new WildCityOutfit(address(usdc), owner);
        address[] memory allowed = new address[](3);
        allowed[0] = address(property);
        allowed[1] = address(vehicle);
        allowed[2] = address(outfit);
        market = new WildCityMarketplace(address(usdc), allowed);
        board = new WildCityLeaderboard(owner);

        for (uint256 i; i < 2; ++i) {
            address p = i == 0 ? ada : tunde;
            usdc.mint(p, 1_000_000000);
            vm.startPrank(p);
            usdc.approve(address(property), type(uint256).max);
            usdc.approve(address(vehicle), type(uint256).max);
            usdc.approve(address(outfit), type(uint256).max);
            usdc.approve(address(market), type(uint256).max);
            vm.stopPrank();
        }
    }

    /* ---------------- catalog ---------------- */

    function test_CatalogsAreSeeded() public view {
        assertEq(property.typeCount(), 7);
        assertEq(vehicle.typeCount(), 4);
        assertEq(outfit.typeCount(), 12);
        assertEq(vehicle.getType(0).price, 1_000000);
    }

    function test_BuyMintsAndTakesUsdc() public {
        vm.prank(ada);
        uint256 id = vehicle.buy(0);
        assertEq(vehicle.ownerOf(id), ada);
        assertEq(vehicle.typeOf(id), 0);
        assertEq(usdc.balanceOf(address(vehicle)), 1_000000);
        (uint256[] memory ids, uint256[] memory types) = vehicle.tokensOfOwner(ada);
        assertEq(ids.length, 1);
        assertEq(types[0], 0);
    }

    function test_BuyRevertsForUnknownInactiveAndSoldOut() public {
        vm.prank(ada);
        vm.expectRevert(abi.encodeWithSelector(WildCityCatalogNFT.UnknownType.selector, 99));
        vehicle.buy(99);

        vm.prank(owner);
        vehicle.setTypeActive(1, false);
        vm.prank(ada);
        vm.expectRevert(abi.encodeWithSelector(WildCityCatalogNFT.InactiveType.selector, 1));
        vehicle.buy(1);

        vm.prank(owner);
        uint256 rare = vehicle.addType("Danfo", 1, 0, 1, 0);
        vm.prank(ada);
        vehicle.buy(rare);
        vm.prank(tunde);
        vm.expectRevert(abi.encodeWithSelector(WildCityCatalogNFT.SoldOut.selector, rare));
        vehicle.buy(rare);
    }

    function test_OnlyOwnerManagesCatalog() public {
        vm.prank(ada);
        vm.expectRevert();
        vehicle.setPrice(0, 1);
        vm.prank(owner);
        vehicle.setPrice(0, 2_000000);
        assertEq(vehicle.getType(0).price, 2_000000);
    }

    /* ---------------- property yield ---------------- */

    function test_YieldAccruesAndIsClaimable() public {
        vm.prank(ada);
        uint256 stall = property.buy(3); // Market Stall: 0.08 USDC a day
        vm.warp(block.timestamp + 2 days);
        assertEq(property.pendingYield(ada), 160000);

        uint256[] memory ids = new uint256[](1);
        ids[0] = stall;
        uint256 before = usdc.balanceOf(ada);
        vm.prank(ada);
        property.claimYield(ids);
        assertEq(usdc.balanceOf(ada) - before, 160000);
        assertEq(property.pendingYield(ada), 0);
    }

    function test_YieldIsCappedAtSevenDays() public {
        vm.prank(ada);
        property.buy(3);
        vm.warp(block.timestamp + 30 days);
        assertEq(property.pendingYield(ada), 7 * 80000);
    }

    function test_TransferKeepsSellersAccruedYieldAsCredit() public {
        vm.prank(ada);
        uint256 stall = property.buy(3);
        vm.warp(block.timestamp + 1 days);
        vm.prank(ada);
        property.transferFrom(ada, tunde, stall);
        assertEq(property.credit(ada), 80000);
        assertEq(property.pendingYield(tunde), 0);
    }

    function test_ClaimRejectsSomeoneElsesToken() public {
        vm.prank(ada);
        uint256 stall = property.buy(3);
        uint256[] memory ids = new uint256[](1);
        ids[0] = stall;
        vm.prank(tunde);
        vm.expectRevert(abi.encodeWithSelector(WildCityProperty.NotTokenOwner.selector, stall));
        property.claimYield(ids);
    }

    /* ---------------- marketplace ---------------- */

    function test_ListAndBuyPaysSellerDirectly() public {
        vm.startPrank(ada);
        uint256 id = vehicle.buy(0);
        vehicle.approve(address(market), id);
        market.list(address(vehicle), id, 3_000000);
        vm.stopPrank();

        uint256 sellerBefore = usdc.balanceOf(ada);
        vm.prank(tunde);
        market.buy(address(vehicle), id, 3_000000);
        assertEq(vehicle.ownerOf(id), tunde);
        assertEq(usdc.balanceOf(ada) - sellerBefore, 3_000000);
        assertEq(market.listingCount(), 0);
    }

    function test_MarketRejectsUnapprovedSelfAndOverpriced() public {
        vm.startPrank(ada);
        uint256 id = vehicle.buy(0);
        vm.expectRevert(WildCityMarketplace.MarketplaceNotApproved.selector);
        market.list(address(vehicle), id, 3_000000);
        vehicle.approve(address(market), id);
        market.list(address(vehicle), id, 3_000000);
        vm.expectRevert(WildCityMarketplace.SelfPurchase.selector);
        market.buy(address(vehicle), id, 3_000000);
        vm.stopPrank();

        vm.prank(tunde);
        vm.expectRevert(abi.encodeWithSelector(WildCityMarketplace.PriceAboveMaximum.selector, 3_000000, 1_000000));
        market.buy(address(vehicle), id, 1_000000);
    }

    function test_StaleListingCanBeCleanedByAnyone() public {
        vm.startPrank(ada);
        uint256 id = vehicle.buy(0);
        vehicle.approve(address(market), id);
        market.list(address(vehicle), id, 3_000000);
        vehicle.transferFrom(ada, tunde, id);
        vm.stopPrank();

        vm.prank(tunde);
        vm.expectRevert(WildCityMarketplace.StaleListing.selector);
        market.buy(address(vehicle), id, 3_000000);

        vm.prank(tunde);
        market.cancel(address(vehicle), id);
        assertEq(market.listingCount(), 0);
    }

    /* ---------------- leaderboard ---------------- */

    function test_LeaderboardOrdersAndRateLimits() public {
        vm.prank(ada);
        board.submitScore(500, 10);
        vm.prank(tunde);
        board.submitScore(900, 5);

        (WildCityLeaderboard.Entry[] memory rich, WildCityLeaderboard.Entry[] memory rep) =
            board.getBoards(board.currentSeason());
        assertEq(rich[0].player, tunde);
        assertEq(rep[0].player, ada);

        vm.prank(ada);
        vm.expectRevert();
        board.submitScore(1000, 10);

        vm.warp(block.timestamp + 1 hours);
        vm.prank(ada);
        board.submitScore(1000, 10);
        (rich,) = board.getBoards(board.currentSeason());
        assertEq(rich[0].player, ada);
    }

    function test_LeaderboardEnforcesCaps() public {
        vm.prank(ada);
        vm.expectRevert(WildCityLeaderboard.ScoreAboveCap.selector);
        board.submitScore(100_000_001, 1);
    }
}
