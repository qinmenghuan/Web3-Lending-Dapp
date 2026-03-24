import { expect } from "chai"; // 导入 Chai 断言库，用于测试断言
import { network } from "hardhat"; // 导入 Hardhat 的 network 模块

// 连接到 Hardhat 网络并获取 ethers 对象
const { ethers } = await network.connect();

// 测试套件：LendingMarket 合约的自动化测试
describe("LendingMarket", function () {
  // 声明合约实例和账户变量
  let lendingMarket: LendingMarket; // LendingMarket 合约实例
  let collateralToken: MockERC20; // 抵押代币合约实例
  let loanToken: MockERC20; // 贷款代币合约实例
  let owner: any; // 合约部署者账户
  let user: any; // 测试用户账户

  // 在每个测试用例前执行的设置函数
  beforeEach(async function () {
    // 获取测试账户：owner 是第一个账户，user 是第二个账户
    [owner, user] = await ethers.getSigners();
    console.log("Owner address:", owner.address); // 演示：owner 是第一个 signer
    console.log("User address:", user.address);   // 演示：user 是第二个 signer

    // 部署模拟的 ERC20 代币合约
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    collateralToken = await MockERC20Factory.deploy("Collateral Token", "COLL"); // 抵押代币
    loanToken = await MockERC20Factory.deploy("Loan Token", "LOAN"); // 贷款代币

    // 部署 LendingMarket 合约，传入抵押代币和贷款代币地址
    const LendingMarketFactory = await ethers.getContractFactory(
      "LendingMarket",
    );
    lendingMarket = await LendingMarketFactory.deploy(
      await collateralToken.getAddress(),
      await loanToken.getAddress(),
    );

    // 为用户铸造抵押代币（由 owner 调用，因为 mint 函数是 external，没有限制）
    await collateralToken.mint(user.address, ethers.parseEther("1000"));
    // 为 LendingMarket 合约铸造贷款代币，用于借贷时转移给用户
    await loanToken.mint(
      await lendingMarket.getAddress(),
      ethers.parseEther("1000"),
    );

    // 用户授权 LendingMarket 合约花费其抵押代币（需要 connect(user) 因为 approve 必须由代币持有者调用）
    await collateralToken
      .connect(user)
      .approve(await lendingMarket.getAddress(), ethers.parseEther("1000"));
  });

  // 测试部署相关的功能
  describe("Deployment", function () {
    // 测试合约是否正确设置了抵押代币和贷款代币地址
    it("Should set the right collateral and loan tokens", async function () {
      expect(await lendingMarket.collateralToken()).to.equal(
        await collateralToken.getAddress(),
      );
      expect(await lendingMarket.loanToken()).to.equal(
        await loanToken.getAddress(),
      );
    });

    // 测试 LTV（贷款价值比）是否设置为 75
    it("Should set LTV to 75", async function () {
      expect(await lendingMarket.LTV()).to.equal(75);
    });
  });

  // 测试存款功能
  describe("Deposit", function () {
    // 测试存款是否正确更新用户位置
    it("Should allow deposit and update position", async function () {
      const depositAmount = ethers.parseEther("100"); // 存款金额：100 个代币（以 wei 为单位）
      await lendingMarket.connect(user).deposit(depositAmount); // 用户调用存款函数

      // 检查用户的位置：抵押品应增加，债务应为 0
      const position = await lendingMarket.positions(user.address);
      expect(position.collateral).to.equal(depositAmount);
      expect(position.debt).to.equal(0);
    });

    // 测试存款是否正确发射 Deposit 事件
    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("100");
      // 断言存款调用应发射 Deposit 事件，并检查参数
      await expect(lendingMarket.connect(user).deposit(depositAmount))
        .to.emit(lendingMarket, "Deposit")
        .withArgs(user.address, depositAmount);
    });
  });

  // 测试借贷功能
  describe("Borrow", function () {
    // 在借贷测试前，先存款
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("100");
      await lendingMarket.connect(user).deposit(depositAmount);
    });

    // 测试在借贷限额内的借贷是否成功
    it("Should allow borrow within limit", async function () {
      const borrowAmount = ethers.parseEther("75"); // 借贷金额：75（100 * 75% = 75）
      await lendingMarket.connect(user).borrow(borrowAmount);

      // 检查用户债务是否正确更新
      const position = await lendingMarket.positions(user.address);
      expect(position.debt).to.equal(borrowAmount);
    });

    // 测试借贷是否正确发射 Borrow 事件
    it("Should emit Borrow event", async function () {
      const borrowAmount = ethers.parseEther("50");
      await expect(lendingMarket.connect(user).borrow(borrowAmount))
        .to.emit(lendingMarket, "Borrow")
        .withArgs(user.address, borrowAmount);
    });

    // 测试超过借贷限额时是否 revert
    it("Should revert if borrow exceeds limit", async function () {
      const borrowAmount = ethers.parseEther("76"); // 超过限额：76 > 75
      await expect(
        lendingMarket.connect(user).borrow(borrowAmount),
      ).to.be.revertedWith("exceeds borrow limit");
    });
  });

  // 测试偿还功能
  describe("Repay", function () {
    // 在偿还测试前，先存款和借贷
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("100");
      await lendingMarket.connect(user).deposit(depositAmount);
      const borrowAmount = ethers.parseEther("50");
      await lendingMarket.connect(user).borrow(borrowAmount);

      // 用户授权 LendingMarket 合约花费其贷款代币用于偿还
      await loanToken
        .connect(user)
        .approve(await lendingMarket.getAddress(), borrowAmount);
    });

    // 测试偿还是否正确更新债务
    it("Should allow repay and update debt", async function () {
      const repayAmount = ethers.parseEther("25"); // 偿还金额：25
      await lendingMarket.connect(user).repay(repayAmount);

      // 检查债务是否减少：50 - 25 = 25
      const position = await lendingMarket.positions(user.address);
      expect(position.debt).to.equal(ethers.parseEther("25"));
    });

    // 测试偿还是否正确发射 Repay 事件
    it("Should emit Repay event", async function () {
      const repayAmount = ethers.parseEther("25");
      await expect(lendingMarket.connect(user).repay(repayAmount))
        .to.emit(lendingMarket, "Repay")
        .withArgs(user.address, repayAmount);
    });
  });

  // 测试健康因子计算
  describe("Health Factor", function () {
    // 测试债务为 0 时健康因子返回 100
    it("Should return 100 if debt is 0", async function () {
      const depositAmount = ethers.parseEther("100");
      await lendingMarket.connect(user).deposit(depositAmount);

      expect(await lendingMarket.healthFactor(user.address)).to.equal(100);
    });

    // 测试健康因子的正确计算
    it("Should calculate health factor correctly", async function () {
      const depositAmount = ethers.parseEther("100");
      await lendingMarket.connect(user).deposit(depositAmount);
      const borrowAmount = ethers.parseEther("50");
      await lendingMarket.connect(user).borrow(borrowAmount);

      // 健康因子计算：((collateral * 100 * LTV) / 100) / debt
      // = (100 * 100 * 75 / 100) / 50 = 7500 / 50 = 150
      expect(await lendingMarket.healthFactor(user.address)).to.equal(150);
    });
  });
});
