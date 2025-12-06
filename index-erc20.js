require("dotenv").config();
const { ethers } = require("ethers");

// 1) Вхідні параметри
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
const RECEIVER = process.env.RECEIVER_ADDRESS;
const AMOUNT = process.env.AMOUNT; // у токенах, наприклад "100"
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const TOKEN_DECIMALS = parseInt(process.env.TOKEN_DECIMALS || "18", 10);

// 2) Мінімальний ABI для ERC-20
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

async function main() {
  if (!RPC_URL || !PRIVATE_KEY || !RECEIVER || !AMOUNT || !TOKEN_ADDRESS) {
    console.error("❌ Заповни RPC_URL, SENDER_PRIVATE_KEY, RECEIVER_ADDRESS, AMOUNT, TOKEN_ADDRESS у .env");
    process.exit(1);
  }
  if (!ethers.isAddress(RECEIVER) || !ethers.isAddress(TOKEN_ADDRESS)) {
    console.error("❌ Невалідна адреса RECEIVER або TOKEN_ADDRESS");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

  // Отримуємо символ та дійсні decimals (якщо не впевнені)
  const symbol = await safeCall(() => contract.symbol(), "symbol") || "TOKEN";
  const onchainDecimals = await safeCall(() => contract.decimals(), "decimals");
  const decimals = Number.isFinite(onchainDecimals) ? onchainDecimals : TOKEN_DECIMALS;

  // Баланс токена відправника
  const bal = await contract.balanceOf(wallet.address);
  const balHuman = ethers.formatUnits(bal, decimals);

  console.log(`👤 Відправник: ${wallet.address}`);
  console.log(`🔹 Токен: ${symbol}`);
  console.log(`💰 Баланс: ${balHuman} ${symbol}`);

  // Сума до переказу у мінімальних одиницях
  const amountUnits = ethers.parseUnits(AMOUNT, decimals);

  try {
    const tx = await contract.transfer(RECEIVER, amountUnits);
    console.log("✅ Транзакція відправлена");
    console.log("🔗 TX Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("📦 Підтверджено у блоку:", receipt.blockNumber);
    console.log("🎯 Статус:", receipt.status === 1 ? "успіх" : "невдача");
  } catch (error) {
    console.error("❌ Помилка надсилання токенів:", parseError(error));
  }
}

async function safeCall(fn, label) {
  try { return await fn(); } catch (e) {
    console.warn(`⚠️ Не вдалося отримати ${label}:`, parseError(e));
    return null;
  }
}

function parseError(error) {
  if (error && error.message) return error.message;
  try { return JSON.stringify(error); } catch { return String(error); }
}

main().catch((e) => console.error("❌ Неперехоплена помилка:", parseError(e)));
