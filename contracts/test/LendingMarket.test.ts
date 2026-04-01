import { expect } from "chai";
import { network } from "hardhat";
// import { MockERC20 } from "../types/ethers-contracts/MockERC20.js";
const { ethers } = await network.connect();

describe("LendingMarket", function () {
  let collateralToken: any;
  let loanToken: any;
  let lendingMarket: any;
  let marketFactory: any;
  let owner: any;
  let user: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user, user1] = await ethers.getSigners();
    // 部署token
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    collateralToken = (await MockERC20Factory.deploy(
      "Collateral Token",
      "COLL",
    )) as MockERC20;
    loanToken = (await MockERC20Factory.deploy(
      "Loan Token",
      "LOAN",
    )) as MockERC20;
    const collateralTokenAddress = await collateralToken.getAddress();
    const loanTokenAddress = await loanToken.getAddress();

    // 部署市场
    const MarketFactoryFactory = await ethers.getContractFactory(
      "MarketFactory",
    );
    marketFactory = (await MarketFactoryFactory.deploy()) as MarketFactory;
    await marketFactory.createMarket(
      collateralTokenAddress,
      loanTokenAddress,
      7500,
    );
    // 获取工厂合约的借贷市场及地址
    const markets = await marketFactory.getMarkets();
    const marketAddress = markets[0]?.market ?? markets[0]?.[0];
    console.log("marketAddress:", marketAddress);
    lendingMarket = (await ethers.getContractAt(
      "LendingMarket",
      marketAddress,
    )) as LendingMarket;
    const lendingMarketAddress = await lendingMarket.getAddress();

    // 充值
    await collateralToken.mint(user.address, ethers.parseEther("1000"));
    await loanToken.mint(user.address, ethers.parseEther("1000"));
    await loanToken.mint(lendingMarketAddress, ethers.parseEther("1000"));

    // 授权借贷市场操作账号的金额
    await collateralToken
      .connect(user)
      .approve(lendingMarketAddress, ethers.parseEther("1000"));
    await loanToken
      .connect(user)
      .approve(lendingMarketAddress, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("should set right collateral and loans tokens", async function () {
      expect(await lendingMarket.collateralToken()).to.equal(
        await collateralToken.getAddress(),
      );
      expect(await lendingMarket.loanToken()).to.equal(
        await loanToken.getAddress(),
      );
      expect(await lendingMarket.ltvBps()).to.equal(7500);
    });

    it("Should set tvl to 75", async function () {
      expect(await lendingMarket.ltvBps()).to.equal(7500);
    });

    it("init deposit");
  });

  describe("Lending operations", function () {
    it("Lender can deposit and withdraw partially", async function () {
      // 存100ether
      await lendingMarket.connect(user).deposit(ethers.parseEther("100"));
      expect(await lendingMarket.deposits(user.address)).to.equal(
        ethers.parseEther("100"),
      );
      let stats = await lendingMarket.stats();
      expect(stats.totalDeposits).to.equal(ethers.parseEther("100"));

      // 取走40ether
      await lendingMarket.connect(user).withDraw(ethers.parseEther("40"));
      expect(await lendingMarket.deposits(user.address)).to.equal(
        ethers.parseEther("60"),
      );
      // 需要重新获取最新数据
      stats = await lendingMarket.stats();
      expect(stats.totalDeposits).to.equal(ethers.parseEther("60"));

      // 校验用户的余额 1000-100+40=940
      expect(await loanToken.balanceOf(user.address)).to.equal(
        ethers.parseEther("940"),
      );
    });

    it("Borrower can supply collateral, borrow and repay", async function () {
      // 质押100ether
      await lendingMarket
        .connect(user)
        .supplyCollateral(ethers.parseEther("100"));
      expect(await lendingMarket.collateralOf(user.address)).to.equal(
        ethers.parseEther("100"),
      );
      let stats = await lendingMarket.stats();
      expect(stats.totalCollateral).to.equal(ethers.parseEther("100"));
      // 1000-100=900
      expect(await collateralToken.balanceOf(user.address)).to.equal(
        ethers.parseEther("900"),
      );

      // 借款30
      await lendingMarket.connect(user).borrow(ethers.parseEther("30"));
      expect(await lendingMarket.debtOf(user.address)).to.equal(
        ethers.parseEther("30"),
      );
      stats = await lendingMarket.stats();
      expect(stats.totalDebt).to.equal(ethers.parseEther("30"));
      expect(await loanToken.balanceOf(user.address)).to.equal(
        ethers.parseEther("1030"),
      );

      // 还款20
      await lendingMarket.connect(user).repay(ethers.parseEther("20"));
      // debt=30-20=10
      expect(await lendingMarket.debtOf(user.address)).to.equal(
        ethers.parseEther("10"),
      );
      stats = await lendingMarket.stats();
      expect(stats.totalDebt).to.equal(ethers.parseEther("10"));
      expect(await loanToken.balanceOf(user.address)).to.equal(
        ethers.parseEther("1010"),
      );

      // 提取质押10
      await lendingMarket
        .connect(user)
        .withdrawCollateral(ethers.parseEther("10"));
      expect(await lendingMarket.collateralOf(user.address)).to.equal(
        ethers.parseEther("90"),
      );
      stats = await lendingMarket.stats();
      expect(stats.totalCollateral).to.equal(ethers.parseEther("90"));
      expect(await collateralToken.balanceOf(user.address)).to.equal(
        ethers.parseEther("910"),
      );
    });
  });
});
