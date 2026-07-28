# Web3 Authentication Design

## Goal

Authenticate a user by proving ownership of a connected wallet. RainbowKit is
used only to connect and display the wallet. There is no separate **Login**
button: after a wallet connects, the application automatically asks the user
to sign a one-time challenge.

Wallet connection and application authentication are different:

- **Connected** means the browser can access the wallet address.
- **Authenticated** means the backend verified a signature and issued a JWT.

Signing the challenge is off-chain, sends no transaction, and costs no gas.

## Frontend design

Keep RainbowKit's wallet connection UI (`ConnectButton` or
`ConnectButton.Custom`), but remove the current `Sign in` button. Add a client
hook such as `useWalletAuth` near the application provider:

```ts
const { address, isConnected } = useAccount();
const { signMessageAsync } = useSignMessage();

useEffect(() => {
  if (!isConnected || !address || hasValidSession(address) || isAuthenticating)
    return;

  authenticate(address, signMessageAsync);
}, [address, isConnected, signMessageAsync]);
```

`authenticate` performs these steps:

1. Call `POST /auth/wallet/request` with the connected address.
2. Ask the wallet to sign the exact `message` returned by the backend.
3. Call `POST /auth/wallet/verify` with the address, message, and signature.
4. Save the returned session and load `GET /auth/me`.

The hook must guard against repeated effects and duplicate wallet prompts.
Track an in-progress attempt and the address used for the current session.
When the wallet address changes or disconnects, clear the old session. If the
user rejects signing, keep the wallet connected, show a non-blocking error, and
allow retry from an account/session menu rather than adding a login button.

Prefer an `HttpOnly`, `Secure`, `SameSite` cookie for the JWT. If the current
Bearer-token implementation is retained, avoid long-lived tokens in
`localStorage` and apply a strict Content Security Policy.

## Backend design and data flow

```text
User connects wallet with RainbowKit
  -> Frontend observes address through Wagmi
  -> POST /auth/wallet/request
  -> Backend creates and stores a random, expiring, unused nonce
  <- Backend returns the complete challenge message
  -> Wallet signs the message through Wagmi
  -> POST /auth/wallet/verify
  -> Backend loads the stored challenge and checks expiry and unused status
  -> Ethers recovers the signer address from message + signature
  -> Backend compares normalized addresses and atomically consumes the nonce
  <- Backend issues JWT/session and returns the user
  -> Protected requests include the JWT/session cookie
```

The frontend must never construct or modify the challenge. The backend is the
source of truth and should bind the message to the wallet address, nonce,
expiration time, application/domain, and chain ID. A production version should
use the SIWE (EIP-4361) message format.

Each nonce is single-use and short-lived. Verification must compare the
submitted message with the stored message, verify its signature, and mark the
nonce used in one transaction to prevent replay. Rate-limit both auth
endpoints, do not log nonces or signatures, and use a strong `JWT_SECRET`.

## Libraries

- **RainbowKit**: wallet selection, connection modal, and account UI. It does
  not authenticate the user with the backend.
- **Wagmi**: React wallet state (`useAccount`) and message signing
  (`useSignMessage`).
- **Viem**: Ethereum types and utilities used by the frontend/Wagmi stack.
- **Ethers.js**: backend address normalization and signer recovery with
  `verifyMessage`.
- **NestJS + class-validator**: auth endpoints, DTO validation, and guards.
- **TypeORM + PostgreSQL**: nonce and user persistence.
- **Passport JWT + @nestjs/jwt**: session token creation and protected-route
  validation.

This design reuses the existing `/auth/wallet/request`,
`/auth/wallet/verify`, and `/auth/me` endpoints; the main frontend change is
moving the flow from a button handler into a guarded wallet-auth hook.
