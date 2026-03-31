// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LendingMarket.sol";

contract MarketFactory {
    struct MarketInfo {
        address market;
        address collateralToken;
        address loanToken;
        uint256 ltvBps;
        bool active;
    }

    MarketInfo[] private _markets;
    event MarketCreated(
        address indexed market,
        address indexed collateralToken,
        address indexed loanToken,
        uint256 ltvBps
    );

    function createMarket(
        address collateralToken,
        address loanToken,
        uint256 ltvBps
    ) external returns (address market) {
        LendingMarket m = new LendingMarket(
            collateralToken,
            loanToken,
            ltvBps,
            address(this)
        );
        market = address(m);
        _markets.push(
            MarketInfo({
                market: market,
                collateralToken: collateralToken,
                loanToken: loanToken,
                ltvBps: ltvBps,
                active: true
            })
        );

        emit MarketCreated(market, collateralToken, loanToken, ltvBps);
    }

    function marketCount() external view returns (uint256) {
        return _markets.length;
    }

    function getMarket(
        uint256 index
    ) external view returns (MarketInfo memory) {
        return _markets[index];
    }

    function getMarkets() external view returns (MarketInfo[] memory) {
        return _markets;
    }
}
