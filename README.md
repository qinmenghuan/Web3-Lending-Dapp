# Web3 Lending Dapp

Web3 Lending Dapp is a full-stack Web3 lending project inspired by isolated lending
markets. Users can connect a wallet, supply ERC-20 liquidity, provide
collateral, borrow assets, repay debt, and view market activity.

The project combines Solidity smart contracts, a Next.js frontend, and a
NestJS indexing/API service. The backend listens to contract events and stores
market and transaction data in PostgreSQL for efficient frontend queries.

## 1. What Is the Project?

The project demonstrates the main components of a decentralized,
overcollateralized lending application:

- A factory contract creates lending markets with configurable collateral,
  loan tokens, and loan-to-value (LTV) limits.
- Lending contracts support deposits, withdrawals, collateral management,
  borrowing, repayment, and position queries.
- The frontend handles wallet connection, token approval, contract reads,
  contract writes, and transaction confirmation.
- The backend provides wallet-signature authentication, REST APIs, and
  on-chain event indexing.

### Main Technologies

- **Contracts:** Solidity 0.8.28, Hardhat 3, Ethers.js, Mocha, Chai
- **Frontend:** Next.js 16, React 19, TypeScript, Wagmi, Viem, RainbowKit,
  TanStack Query, Tailwind CSS
- **Backend:** NestJS 11, TypeScript, Ethers.js, TypeORM, PostgreSQL, Redis,
  Passport, JWT
- **Network:** Ethereum-compatible networks, including Sepolia

## 2. Project Structure

```text
huan-morpho/
├── contracts/                  # Smart contracts and blockchain tooling
│   ├── contracts/
│   │   ├── LendingMarket.sol   # Core lending and collateral logic
│   │   ├── MarketFactory.sol   # Creates isolated lending markets
│   │   └── MockERC20.sol       # Test ERC-20 token
│   ├── scripts/                # Deployment scripts
│   ├── test/                   # Smart contract tests
│   └── hardhat.config.ts
├── backend/                    # NestJS API and event indexer
│   ├── src/modules/auth/       # Wallet-signature login and JWT
│   ├── src/modules/blockchain/ # RPC connection and event listeners
│   ├── src/modules/market/     # Market APIs and persistence
│   ├── src/modules/loan/       # Transaction history APIs
│   └── src/common/             # Database and Redis services
├── frontend/                   # Next.js Web3 application
│   ├── app/                    # Pages and application layouts
│   ├── components/             # Shared UI components
│   └── lib/                    # Wagmi, API, auth, and contract helpers
└── README.md
```

## 3. How to Start the Project

### Prerequisites

Install the following tools and services:

- Node.js 20 or later
- npm
- PostgreSQL
- Redis
- An Ethereum JSON-RPC endpoint
- Deployed `MarketFactory` and `LendingMarket` contract addresses

Each application is managed independently, so install dependencies in all
three directories:

```bash
cd contracts
npm install

cd ../backend
npm install

cd ../frontend
npm install
```

### Configure the Contracts

Create `contracts/.env`:

```dotenv
SEPOLIA_RPC_URL=https://your-sepolia-rpc-url
SEPOLIA_PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

Never commit private keys or real secrets.

Run the contract tests:

```bash
cd contracts
npx hardhat test
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

Copy the deployed contract addresses into the backend configuration.

### Configure and Start the Backend

Create `backend/.env`:

```dotenv
PORT=3001
RPC_URL=https://your-ethereum-rpc-url
LOAN_CONTRACT=0xYourLendingMarketAddress
MARKET_FACTORY_CONTRACT=0xYourMarketFactoryAddress

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=huan_morpho

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1d
LOGIN_NONCE_EXPIRES_MS=300000
```

Make sure PostgreSQL and Redis are running, then start the API:

```bash
cd backend
npm run start:dev
```

The backend will be available at `http://localhost:3001`.

### Configure and Start the Frontend

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Start the development server:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` and connect a supported wallet.

### Useful Commands

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
npm run lint
npm run test
npm run build

# Contracts
cd contracts
npx hardhat test
```

## 4. Common Coding Standards

### General

- Use TypeScript for frontend, backend, scripts, and tests.
- Keep functions focused and use clear domain names such as `market`,
  `collateral`, `debt`, and `allowance`.
- Avoid duplicated business logic; place shared behavior in services or helper
  modules.
- Validate external input and handle errors with useful messages.
- Never commit `.env` files, private keys, API keys, or JWT secrets.
- Keep pull requests focused and update tests and documentation when behavior
  changes.

### Frontend

- Use functional React components and hooks.
- Keep reusable UI in `components/` and API/Web3 helpers in `lib/`.
- Use Wagmi and Viem for contract access and bigint-safe unit conversion.
- Never use JavaScript `number` for raw token amounts; preserve on-chain values
  as `bigint` and convert only for display.
- Represent pending, confirmed, rejected, and reverted transaction states in
  the UI.
- Run `npm run lint` and `npm run build` before submitting changes.

### Backend

- Follow the NestJS module-controller-service pattern.
- Validate request payloads with DTOs and `class-validator`.
- Keep blockchain access, persistence, and HTTP concerns separated.
- Store raw on-chain integer values as strings to avoid precision loss.
- Make event processing idempotent when adding production indexing logic.
- Format with Prettier and verify changes with lint, tests, and build commands.

### Smart Contracts

- Follow Solidity naming conventions: contracts and structs in `PascalCase`,
  functions and variables in `camelCase`, and constants in `UPPER_SNAKE_CASE`.
- Use checks-effects-interactions and reentrancy protection for token
  transfers.
- Validate addresses, amounts, liquidity, and collateral requirements.
- Emit an event for every state-changing business operation.
- Use basis points for percentage values and document their scale.
- Add tests for successful operations, access rules, edge cases, and expected
  reverts before deployment.
