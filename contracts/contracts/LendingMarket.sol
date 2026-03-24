// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingMarket {
    IERC20 public collateralToken;
    IERC20 public loanToken;

    uint256 public LTV = 75;

    struct Position {
        // TODO: unit256
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => Position) public positions;

    // TODO: indexed
    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);

    constructor(address _collateral, address _loan) {
        collateralToken = IERC20(_collateral);
        loanToken = IERC20(_loan);
    }

    function deposit(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);

        positions[msg.sender].collateral += amount;

        emit Deposit(msg.sender, amount);
    }

    function borrow(uint256 amount) external {
        Position storage p = positions[msg.sender];
        require(
            (p.collateral * LTV) / 100 >= p.debt + amount,
            "exceeds borrow limit"
        );

        p.debt += amount;

        loanToken.transfer(msg.sender, amount);

        emit Borrow(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        Position storage p = positions[msg.sender];
        require(amount <= p.debt, "repay amount exceeds debt");
        loanToken.transferFrom(msg.sender, address(this), amount);
        p.debt -= amount;
        emit Repay(msg.sender, amount);
    }

    function healthFactor(address user) external view returns (uint256) {
        Position memory p = positions[user];
        if (p.debt == 0) return 100;
        return ((p.collateral * 100 * LTV) / 100) / p.debt;
    }
}
