# web3-transfer
Node.js script for sending ETH/ERC20 tokens using ethers.js


Скрипти для переказу ETH  у Ethereum-сумісних мережах.

## Вимоги
- Node.js ≥ 18
- RPC провайдер (Infura, Alchemy або власний)

## Інсталяція
```bash
git clone https://github.com/Yaroslav071315/web3-transfer
cd web3-transfer
npm install

## Приклад env
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
SENDER_PRIVATE_KEY=ваш_приватний_ключ
RECEIVER_ADDRESS=адреса_одержувача
AMOUNT=0.01


## Запуск
ETH:

node index.js

ERC-20:

node index-erc20.js