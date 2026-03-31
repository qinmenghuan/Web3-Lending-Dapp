// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IERC20.sol";

contract LendingMarket {
    address public immutable collateralToken;
    address public immutable loanToken;
    uint256 public immutable ltvBps; // 例如7500 就是75%
    address public immutable factory;

    // 防重入锁
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "Reentrant");
        _locked = 2;
        // 继续执行业务逻辑
        _;
        _locked = 1;
    }

    // 借贷市场统计数据
    struct MarketStats {
        uint256 totalDeposits;
        uint256 totalCollateral;
        uint256 totalDebt;
    }

    MarketStats public stats;

    // 贷款人存款（提供流动性）
    mapping(address => uint256) public deposits;
    // 借款人抵押物
    mapping(address => uint256) public collateralOf;
    // 借款人债务
    mapping(address => uint256) public debtOf;

    // 贷款人存款
    event Deposited(address indexed user, uint256 amount);
    // 贷款人取款
    event WithDrawn(address indexed user, uint256 amount);
    // 借款人质押
    event CollateralSupplied(address indexed user, uint256 amount);
    // 借款人取回质押
    event CollateralWithdrawn(address indexed user, uint256 amount);
    // 借款人借款
    event Borrowed(address indexed user, uint256 amount);
    // 借款人还款
    event Repaid(address indexed user, uint256 amount);

    constructor(
        address _collateralToken,
        address _loanToken,
        uint256 _ltvBps,
        address _factory
    ) {
        require(_collateralToken != address(0), "bad collateral");
        require(_loanToken != address(0), "bad loan");
        require(_ltvBps > 0 && _ltvBps < 9000, "bad ltv");
        collateralToken = _collateralToken;
        loanToken = _loanToken;
        ltvBps = _ltvBps;
        factory = _factory;
    }

    // 贷款人存款
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "deposit should more than 0");
        require(
            IERC20(loanToken).transferFrom(msg.sender, address(this), amount),
            "transferFrom failure"
        );

        deposits[msg.sender] += amount;
        stats.totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    // 贷款人取款
    function withDraw(uint256 amount) external nonReentrant {
        require(amount > 0, "withdraw should more than 0");
        require(
            deposits[msg.sender] > amount,
            "deposit should more than withdraw"
        );
        require(getAvailableLiquidity() > 0, "bad liquidity");

        deposits[msg.sender] -= amount;
        stats.totalDeposits -= amount;
        require(
            IERC20(loanToken).transfer(msg.sender, amount),
            "transfer failure"
        );
        emit WithDrawn(msg.sender, amount);
    }

    // 提供质押
    function supplyCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "amount =0 ");
        // TODO: 授权校验
        require(
            IERC20(collateralToken).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "transfer failure"
        );

        stats.totalCollateral += amount;
        collateralOf[msg.sender] += amount;
        emit CollateralSupplied(msg.sender, amount);
    }

    // 借款
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        uint256 collateral = collateralOf[msg.sender];
        require(
            ((collateral * ltvBps) / 10000) >= (amount + debtOf[msg.sender]),
            "exceeds borrow limit"
        );
        debtOf[msg.sender] += amount;
        stats.totalDebt += amount;

        require(
            IERC20(loanToken).transfer(msg.sender, amount),
            "transfer failure"
        );

        emit Borrowed(msg.sender, amount);
    }

    // 还款
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "amount =0");
        uint256 debt = debtOf[msg.sender];
        require(amount <= debt, "repay amount exceeds debt");
        require(debt > 0, "repay amount =0");
        debtOf[msg.sender] -= amount;
        stats.totalDebt -= amount;
        require(
            IERC20(loanToken).transferFrom(msg.sender, address(this), amount),
            "transfer failure"
        );
        emit Repaid(msg.sender, amount);
    }

    // 提取质押物
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "amount =0");
        uint256 maxBorrowAfterWithdraw = ((collateralOf[msg.sender] - amount) *
            ltvBps) / 10000;
        require(
            debtOf[msg.sender] <= maxBorrowAfterWithdraw,
            "would be undercollateralized"
        );
        require(collateralOf[msg.sender] >= amount, "insufficient collateral");
        collateralOf[msg.sender] -= amount;
        stats.totalCollateral -= amount;
        require(
            IERC20(collateralToken).transfer(msg.sender, amount),
            "transfer failure"
        );
        emit CollateralWithdrawn(msg.sender, amount);
    }

    // 健康因子
    function healthFactor(address user) external view returns (uint256) {
        uint256 debt = debtOf[user];
        if (debt == 0) return 100;
        return ((collateralOf[user] * ltvBps) / 100) / debt;
    }

    // 获取当前市场最大的借款的数额
    function getAvailableLiquidity() public view returns (uint256) {
        return IERC20(loanToken).balanceOf(address(this));
    }

    // 获取用户的仓位信息
    function getUserPosition(
        address user
    )
        public
        view
        returns (
            uint256 depositAmount,
            uint256 collateralAmount,
            uint256 debtAmount,
            uint256 maxBorrowAmount,
            uint256 availableToBorrow
        )
    {
        depositAmount = deposits[user];
        collateralAmount = collateralOf[user];
        debtAmount = debtOf[user];
        // 最大可借款金额
        maxBorrowAmount = (collateralOf[user] * ltvBps) / 10000;
        // 实际可借款金额
        availableToBorrow = maxBorrowAmount > debtAmount
            ? (maxBorrowAmount - debtAmount)
            : 0;
    }
}
