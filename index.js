// index.js
require("dotenv").config();
const { ethers } = require("ethers");

// 1) Параметри з .env
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
const RECEIVER = process.env.RECEIVER_ADDRESS;
const AMOUNT = process.env.AMOUNT; // у ETH, наприклад "0.01"

async function main() {
  // 2) Базові валідації
  if (!RPC_URL || !PRIVATE_KEY || !RECEIVER || !AMOUNT) {
    console.error("❌ Будь ласка, заповни RPC_URL, SENDER_PRIVATE_KEY, RECEIVER_ADDRESS, AMOUNT у .env");
    process.exit(1);
  }
  if (!ethers.isAddress(RECEIVER)) {
    console.error("❌ Невалідна адреса одержувача");
    process.exit(1);
  }

  // 3) Провайдер та гаманець
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // 4) Перевірка балансу
  const balanceWei = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balanceWei);
  console.log(`👤 Відправник: ${wallet.address}`);
  console.log(`💰 Баланс: ${balanceEth} ETH`);

  // 5) Формування транзакції
  const tx = {
    to: RECEIVER,
    value: ethers.parseEther(AMOUNT),
    // Можна явно вказати gasPrice / maxFeePerGas / maxPriorityFeePerGas якщо треба
  };

  try {
    // 6) Відправка
    const sentTx = await wallet.sendTransaction(tx);
    console.log("✅ Транзакція відправлена");
    console.log("🔗 TX Hash:", sentTx.hash);

    // 7) Очікування підтвердження
    const receipt = await sentTx.wait();
    console.log("📦 Підтверджено у блоку:", receipt.blockNumber);
    console.log("🎯 Статус:", receipt.status === 1 ? "успіх" : "невдача");
  } catch (error) {
    // 8) Обробка помилок
    console.error("❌ Помилка надсилання:", parseError(error));
  }
}

// Допоміжна обробка помилок
function parseError(error) {
  if (error && error.message) return error.message;
  try { return JSON.stringify(error); } catch { return String(error); }
}

main().catch((e) => console.error("❌ Неперехоплена помилка:", parseError(e)));
