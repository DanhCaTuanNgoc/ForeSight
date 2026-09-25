FORESIGHT
Decision Support and Autonomous Execution Terminal for DreamDEX on Somnia L1

Tagline: Detect the move. Challenge the thesis. Model the trajectory. Execute on-chain.
Philosophy: Understand the market before you trade it.

--------------------------------------------------------------------------------
1. PROJECT LINKS AND NETWORK DETAILS
--------------------------------------------------------------------------------

Live Web Terminal:
https://foresightdex.vercel.app/

Target Network:
Somnia Shannon Testnet (Chain ID: 50312)

Target Protocol:
DreamDEX Event Contracts (CLOB)

Deployed Smart Contract (Batch Sweeper):
0x0df05851d944bfd01e6bc772e27738c23b6e30f9
View on Somnia Explorer:
https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9

GitHub Repository:
https://github.com/DanhCaTuanNgoc/ForeSight

Test Status:
12 test suites, 137 out of 137 tests passed (100% pass rate)

Tech Stack:
Solidity, React 19, TypeScript, Viem, Somnia Markets SDK

--------------------------------------------------------------------------------
2. THE PROBLEMS WE SOLVE
--------------------------------------------------------------------------------

On fast-paced prediction markets (1-minute, 5-minute, 15-minute rounds), retail traders face three major frustrations:

1. The Casino Trap:
Odds swing wildly without context. Traders jump in on emotional FOMO without knowing if price momentum can actually reach the strike price before time runs out.

2. Unreliable Black-Box AI:
Generic AI prediction bots output arbitrary percentage guesses that hallucinate and lack verifiable evidence.

3. Stranded Capital:
Winning payouts and unfilled limit orders get scattered across dozens of expired pools. Traders are forced to manually claim them one by one, wasting gas and time.

--------------------------------------------------------------------------------
3. HOW FORESIGHT WORKS (THE 4-STEP DECISION LOOP)
--------------------------------------------------------------------------------

Step 1: DETECT
The Mini Strike Radar tracks the distance between spot price and strike price in real-time basis points, while the Orderbook Imbalance meter shows bid-ask depth dominance directly on the chart.

Step 2: CHALLENGE
Instead of trusting a single black-box AI, ForeSight runs an adversarial Dual AI Debate:
- Google Gemini 2.5 Flash defends the Bull case using short-term momentum.
- Meta LLaMA 3.3 70B defends the Bear thesis evaluating macro risks.
- Every claim includes clickable, verified real-world news citations.

Step 3: SIMULATE
ForeSight introduces Velocity Coverage (VC) to model trajectory feasibility:
- Velocity Coverage compares current price speed against the speed required to hit the strike before round expiration.
- A score of 1.0x or higher confirms the move is physically achievable.
- A score below 1.0x warns of a theta-decay trap and rejects the trade to protect capital.

Step 4: EXECUTE AND SWEEP
- Polymarket-Standard Ticket: Intuitive trade ticket with preset chips ($10, $25, $50) and real-time payout calculations.
- Trading Cutoff Protection: Disables order submission 10 seconds before expiry to prevent failed transactions.
- Autonomous Order Runner: Automates multi-round Momentum or Reversal strategies with smart auto-routing and non-custodial wallet protection.
- 1-Click Batch Sweeper: Custom smart contract that redeems all winning payouts across multiple pools in one single transaction.

--------------------------------------------------------------------------------
4. VERIFIED ON-CHAIN PROOF ON SOMNIA SHANNON
--------------------------------------------------------------------------------

Every key capability of ForeSight is verified on-chain:

1. Custom Batch Sweeper Contract:
Address: 0x0df05851d944bfd01e6bc772e27738c23b6e30f9
Deployment Transaction:
https://shannon-explorer.somnia.network/tx/0x0042f7f304e036493b529d2cd6e77e359f0952db358e33799912d9e0a19cf275

2. Winning Payout Claim:
Confirmed on-chain settlement claim (+44.9% ROI) in Block 484521336:
https://shannon-explorer.somnia.network/tx/0xf4caf3577f52428af2ce7d6ec87b11428b403008b21ab4bce6d3c50fc22519b6

3. 100% Collateral Principal Refund:
Unfilled limit order principal ($50.00 tUSDC) refunded back to wallet in Block 484005732:
https://shannon-explorer.somnia.network/tx/0x58f77beab8dc966f8faca8f71c2f529dee14f06e6fc3105471695598d8a48ef0

4. Autonomous Order Runner:
On-chain limit order dispatch to DreamDEX CLOB on Somnia Shannon:
https://shannon-explorer.somnia.network/tx/0x87a36ce4c647a6a836e0f13b021386d87dbb5603928b093f06f0490ffa51da0b

--------------------------------------------------------------------------------
5. SOCIAL PROOF: ALPHA CARD STUDIO
--------------------------------------------------------------------------------

ForeSight features a built-in Alpha Card Studio that converts winning trades into high-resolution 1200x675 graphic cards. Each card is cryptographically stamped with the verifiable on-chain transaction hash and direct Somnia Explorer link, making results transparent and easy to share on X and Telegram.

--------------------------------------------------------------------------------
6. TEAM INFORMATION
--------------------------------------------------------------------------------

Role: Solo Builder

Description:
I am a solo builder who got tired of prediction markets looking like casino slots. Built ForeSight from scratch—wrote the contracts on Somnia, wired up the dual-AI debate, solved the trajectory physics, and shipped the whole terminal. 137 passing tests, code speaks for itself.

License:
MIT License — Built for the Somnia x DreamDEX Event Contracts Hackathon.
Special thanks to the Somnia Network and DreamDEX teams.
