import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: "Huan-morpho",
  projectId: "2711ec0dfc109633fa782a27c8253c4a",
  chains: [mainnet, sepolia, polygon, optimism],
  transports: {
    [mainnet.id]: http(
      "https://mainnet.infura.io/v3/4b0a01cb618e4f139038fdf4306d6eb9",
    ),
    [sepolia.id]: http(
      "https://sepolia.infura.io/v3/4b0a01cb618e4f139038fdf4306d6eb9",
    ),
    [polygon.id]: http(
      "https://polygon-mainnet.infura.io/v3/4b0a01cb618e4f139038fdf4306d6eb9",
    ),
    [optimism.id]: http(
      "https://optimism-mainnet.infura.io/v3/4b0a01cb618e4f139038fdf4306d6eb9",
    ),
  },
  ssr: true,
});
