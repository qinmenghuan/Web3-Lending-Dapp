# AGENTS.md

## Project overview

Huan Morpho is a full-stack, overcollateralized Web3 lending demo:

- `contracts/`: Solidity 0.8.28 contracts, Hardhat 3 tooling, deployment scripts,
  and contract tests.
- `backend/`: NestJS 11 REST API, wallet-signature authentication, PostgreSQL
  persistence, and on-chain event indexing.
- `frontend/`: Next.js 16 App Router UI using React 19, Wagmi, Viem,
  RainbowKit, and TanStack Query.

There is no root package manager workspace. Each directory has its own
`package.json` and `package-lock.json`; run npm commands from the relevant
directory and keep dependency changes scoped to that package.

More specific `AGENTS.md` files override this file for their directory. In
particular, read `frontend/AGENTS.md` before changing frontend code.

## Repository map

- `contracts/contracts/LendingMarket.sol`: lending, collateral, borrowing, and
  repayment logic.
- `contracts/contracts/MarketFactory.sol`: isolated market creation.
- `contracts/contracts/MockERC20.sol`: test token.
- `contracts/test/`: Hardhat/Mocha contract tests.
- `contracts/scripts/` and `contracts/ignition/`: deployment tooling.
- `backend/src/modules/auth/`: nonce-based wallet login and JWT handling.
- `backend/src/modules/blockchain/`: RPC access, ABIs, and event listeners.
- `backend/src/modules/{market,loan,vault}/`: controllers, services, entities,
  and DTOs for lending data.
- `backend/src/common/`: PostgreSQL/TypeORM and Redis integration.
- `frontend/app/`: App Router pages, layouts, and page-local components.
- `frontend/components/ui/`: reusable UI primitives.
- `frontend/lib/`: authentication, market, contract, Wagmi, and shared helpers.

## Setup and commands

Use Node.js 20 or newer and npm. Install dependencies separately:

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

Run the smallest relevant checks first, then the broader package checks.

### Contracts

```bash
cd contracts
npx hardhat test
npx hardhat test test/LendingMarket.test.ts
```

`npm test` in `contracts/` is only the default placeholder and intentionally
fails; use `npx hardhat test`.

### Backend

```bash
cd backend
npm test
npm run test:e2e
npm run build
npm run lint
```

To target one Jest test:

```bash
npx jest src/app.controller.spec.ts
```

The backend `lint` script includes `--fix` and can modify files. Review its
diff after running it.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

Before changing Next.js APIs or conventions, follow the version-specific
instruction in `frontend/AGENTS.md`.

## Environment and local services

Never commit `.env`, `.env.local`, private keys, seed phrases, JWT secrets,
database passwords, or private RPC credentials.

- `contracts/.env`: `SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`, and optionally
  `ETHERSCAN_API_KEY`.
- `backend/.env`: `PORT`, `RPC_URL`, `LOAN_CONTRACT`,
  `MARKET_FACTORY_CONTRACT`, PostgreSQL settings, Redis settings, and JWT/nonce
  settings. See the root `README.md` for the complete list.
- `frontend/.env.local`: `NEXT_PUBLIC_API_BASE_URL`.

Backend integration/e2e work may require PostgreSQL, Redis, an Ethereum RPC
endpoint, and deployed contract addresses. Do not claim those checks passed
when the required services were unavailable.

## Engineering conventions

### General

- Preserve the existing architecture and naming unless the task requires a
  refactor.
- Keep changes focused; do not reformat or rewrite unrelated files.
- Use TypeScript for application code, scripts, and tests.
- Validate data at trust boundaries and return actionable errors.
- Add or update tests when behavior changes.
- Do not edit generated output such as `.next/`, `dist/`, `artifacts/`,
  `cache/`, or `coverage/`.
- Preserve the existing npm lockfile for each package; do not introduce a
  different package manager.

### Web3 and cross-package behavior

- Treat raw token balances, allowances, debts, collateral, and other on-chain
  integers as `bigint` in the frontend or decimal strings in persistence/API
  boundaries. Never route raw token amounts through JavaScript `number`.
- Use Viem/Wagmi unit helpers for parsing and formatting token values.
- Model wallet rejection, pending submission, confirmation, and reverted
  transactions explicitly.
- Validate chain IDs and contract addresses before writes.
- A contract interface or event change usually requires coordinated updates
  to contract tests, backend ABI/listener code, frontend ABI/helpers, and
  documentation. Search all three packages before considering it complete.
- Keep event ingestion idempotent. Replayed logs must not create duplicate
  domain records.

### Smart contracts

- Use `PascalCase` for contracts/structs, `camelCase` for functions/variables,
  and `UPPER_SNAKE_CASE` for constants.
- Follow checks-effects-interactions for external token transfers and guard
  reentrancy where applicable.
- Validate zero addresses, zero amounts, balances, liquidity, allowances, LTV,
  and collateral constraints.
- Emit events for business-relevant state changes.
- LTV values use basis points; keep scale and rounding behavior explicit.
- Add success, revert, boundary, and authorization tests for changed logic.
- Never deploy, verify, or send a live transaction unless the user explicitly
  asks for it and the target network/account have been confirmed.

### Backend

- Follow the NestJS module/controller/service structure.
- Keep HTTP handling, blockchain access, and persistence concerns separated.
- Use DTOs plus `class-validator` for request validation.
- Store on-chain integer values without precision loss.
- Be cautious with TypeORM `synchronize: true`; it is suitable for this demo's
  local workflow, not a production migration strategy.

### Frontend

- Prefer Server Components unless wallet state, browser APIs, effects, or
  interactivity require a Client Component.
- Keep route-specific components near their route and reusable primitives in
  `components/`.
- Keep contract/API/auth configuration and reusable data logic in `lib/`.
- Reuse the existing UI primitives and styling conventions before adding new
  dependencies or parallel abstractions.

## Completion checklist

Before handing off a change:

1. Review `git diff` and ensure only intended files changed.
2. Run the most relevant tests, lint, and build commands listed above.
3. For contract changes, verify every ABI and event consumer across backend and
   frontend.
4. Report checks that passed, checks that were not run, and any dependency on
   external services or credentials.
