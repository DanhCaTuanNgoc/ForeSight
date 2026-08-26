# Somnia

> Somnia is the Agentic L1, a hyper-performance Layer 1 blockchain operating at an order of magnitude faster than existing networks. It enables decentralized products that were previously impossible and cannot be built anywhere else. Somnia delivers over 1 million transactions per second with sub-second finality and sub-cent gas fees. The network is fully EVM-compatible and powered by the SOMI token.

Somnia's performance comes from MultiStream consensus (a proof-of-stake, partially synchronous BFT protocol where every validator publishes its own data chain), IceDB (a custom database with 15-100 nanosecond read/write operations and built-in snapshotting), compiled EVM bytecode that runs at near-native machine code speeds, and advanced streaming compression with BLS signature aggregation. Rather than relying on parallel execution across multiple cores, Somnia optimizes single-core performance because parallel execution breaks down during correlated load spikes.

Somnia is fully EVM-compatible. Developers can deploy any Solidity contract without changes using Hardhat, Foundry, viem, or Ethers.js exactly as they would on Ethereum.

Somnia Agents are consensus-validated compute jobs that can access off-chain data. They pull from APIs, scrape websites, and run AI inference, all with the same trust guarantees as on-chain execution. Multiple validators independently fetch and verify the same data, reaching consensus on the result before it enters the chain, with no single oracle or point of failure. Agents are invoked via standard Solidity ABI encoding, so developers can interact with them using familiar tools. The three core agent types are JSON API Request (fetches data from any public API endpoint), LLM Parse Website (scrapes and interprets full web pages including JavaScript-rendered content using AI), and LLM Inference (runs deterministic AI models on-chain for analysis and decision-making).

Native Reactivity lets smart contracts respond automatically to on-chain and off-chain events without being called by an external transaction. Traditional smart contracts sit idle until triggered, requiring off-chain bots or keepers. On Somnia, contracts can listen for conditions and execute the moment those conditions are met.

SOMI has a fixed supply of 1,000,000,000 tokens. Validators stake SOMI to secure the network and 50% of gas fees are burned. Token distribution prioritizes community (27.925%) and ecosystem (27.345%), with vesting schedules of up to 48 months for team and investors. Validators are required to stake 5,000,000 SOMI to run a node.

Application categories enabled by Somnia include fully on-chain order book exchanges that rival centralized exchange speed, prediction markets that resolve through AI agents verifying real-world outcomes, real-time games where in-game events trigger instant on-chain settlement, DeFi protocols that pull price feeds from any API without third-party oracles, and AI-native applications where smart contracts reason over unstructured data using on-chain LLM inference.

## Documentation

- [Somnia Developer Docs](https://docs.somnia.network/): Full technical documentation including network info, smart contract guides, tutorials, and API references
- [Getting Started on Mainnet](https://docs.somnia.network/get-started/getting-started-for-mainnet): How to connect wallets, get SOMI tokens, and begin building (NEEDS INPUT - verify exact path)
- [Network Overview](https://docs.somnia.network/developer/network-info/network-overview-mainnet-testnet): Mainnet and testnet configuration, RPC endpoints, and chain IDs
- [Smart Contract Tutorials](https://docs.somnia.network/developer/tutorials): Step-by-step guides for deploying contracts using Hardhat, Foundry, and Viem
- [FAQs](https://docs.somnia.network/developer/deployment-and-production/support-and-community/general-faqs): Comprehensive answers to common questions about Somnia Network

## Blog and Updates

- [Somnia Blog](https://somnianetwork.substack.com/): Official blog with ecosystem updates, partnership announcements, technical explainers, and community news

## Website

- [Somnia Homepage](https://somnia.network/)

## Community

- [Discord](https://discord.com/invite/somnia): Developer support, community discussion, and test token requests
- [X (Twitter)](https://x.com/Somnia_Network): Official announcements and ecosystem updates