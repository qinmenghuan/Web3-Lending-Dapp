const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// 钱包地址请求登录
export async function requestWalletLogin(walletAddress: string) {
  const res = await fetch(`${API_BASE_URL}/auth/wallet/request`, {
    method: "POST",
    body: JSON.stringify({
      walletAddress: walletAddress,
    }),
  });

  if (!res.ok) {
    throw new Error("Fail to request wallet login");
  }
  return res.json();
}

// 登录验证
export async function verifyWalletLogin(params: {
  walletAddress: string;
  message: string;
  signature: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/wallet/verify`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error("Fail to verify the wallet login");
  }

  return res.json();
}

// 获取个人信息
export async function getMe(token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to get current user");
  }
  return res.json();
}
