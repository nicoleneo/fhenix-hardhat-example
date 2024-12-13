# Installation

The first things you need to do are cloning this repository and installing its dependencies:

```sh
git clone https://github.com/nicoleneo/fhenix-hardhat-example.git
cd fhenix-hardhat-example
pnpm install

Install [MetaMask](https://metamask.io/) browser wallet.


Next, you need an .env file containing your mnemonics or keys. You can use .env.example that comes with a predefined mnemonic, or use your own

```sh
cp .env.example .env
```

Generate a 12-word mnemonic with the [generator](https://iancoleman.io/bip39/#english) and replace the value of `MNEMONIC` in `.env`.


Once the file exists, let's run a LocalFhenix instance:

```sh
pnpm localfhenix:start
```

This will start a LocalFhenix instance in a docker container. If this worked you should see a `Started LocalFhenix successfully` message in your console.

Now that we have a LocalFhenix instance running, we can deploy our contracts to it:

```sh
pnpm deployContract
```

This deploys the contracts to the configured wallet in `.env` and creates the JSON front-end files in `frontend/src/contracts`.


Note that this template defaults to use the `localfhenix` network, which is injected into the hardhat configuration.

Note: To list all accounts use `pnpm task:listTokenBalance --numaccounts 10`

Run `pnpm task:listTokenBalance` which returns the first 3 accounts.s

```sh
$ pnpm task:listTokenBalance

> fhenix-hardhat-example@1.0.0 task:listTokenBalance /workspaces/fhenix-hardhat-example
> hardhat task:listTokenBalance


Account Details:
================

Account 0: (alice)
Address:     0xd7702EB6Ca4C101C918f7d4eaBeDc36e36260482
Private Key: 0x099359fa750740ba9896b779845327388549ccc87dc2ac35afdd802fa4336cb7
Balance: 9.9999550323 ETH
Token balance: 1000000 MHT

Account 1: (bob)
Address:     0x3F9CD0795CCf3bEEd6fB510A2b0db6950696ea30
Private Key: 0xae14717942a76b675a1a32eae485510b1c859502fb02774391a16e03c816c5f2
Balance: 0.0 ETH
Token balance: 0 MHT

Account 2: (carol)
Address:     0x4605eC2552cB2433A9b4B83881dd2473C709b4e8
Private Key: 0x48dab7cf3c5d874f357c821691a6851021cdd5ddc07d97374a3debc813821546
Balance: 0.0 ETH
Token balance: 0 MHT
```

Account #0 (alice/ deployer) was funded with 10 ETH to have enough gas to deploy the contract. It is the owner of the contract. It has Token balance: 1000000 MHT which is the `totalSupply`.

```solidity
    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }
```

# Front-end

## Configure MetaMask browser plugin
Networks > Add a network > Add a network manually
    Network name: localfhenix
    New RPC URL: http://localhost:42069
    Chain ID: 420105
    Currency symbol: GO


The front-end implements an interface for transferring MHT (My Hardhat Token) to different wallets.

```sh
cd frontend
npm install
```


To run it, you just need to execute `npm start` in a terminal, and open
[http://localhost:3000](http://localhost:3000).


There will be a screen after connecting your MetaMask Wallet.

    My Hardhat Token (MHT)
    Welcome 0xfc922e72b48469780856a69e08b7d0fcd811b7bc, you have 0 MHT.

    You don't have tokens to transfer

    To get some tokens, open a terminal in the root of the repository and run:

    pnpm task:faucet 0xfc922e72b48469780856a69e08b7d0fcd811b7bc


This is your [browser client] Token contract instance (n.b. this is different from the deployer who is the owner of the Token contract).

Give your wallet some ETH and MHT tokens.

```sh
pnpm task:faucet 0xfc922e72b48469780856a69e08b7d0fcd811b7bc

> fhenix-hardhat-example@1.0.0 task:faucet /workspaces/fhenix-hardhat-example
> hardhat task:faucet "0xfc922e72b48469780856a69e08b7d0fcd811b7bc"

Transferred 1 ETH and 100 tokens to 0xfc922e72b48469780856a69e08b7d0fcd811b7bc. Token balance: 100 MHT
```

The browser screen will refresh with a form and the updated MHT token balance.

Transfer to 15 MHT to Account #1. Copy the Address from the `pnpm task:listTokenBalance` output.

Click 'Transfer'. A MetaMask popup window will open to confirm the transaction.

The browser screen will update with the updated balance i.e. 85 MHT.


Run `pnpm task:listTokenBalance` again. Account #1 will have the updated token balance reflecting the amount received.

```sh
pnpm task:listTokenBalance

> fhenix-hardhat-example@1.0.0 task:listTokenBalance /workspaces/fhenix-hardhat-example
> hardhat task:listTokenBalance


Account Details:
================

Account 0: (alice)
Address:     0xd7702EB6Ca4C101C918f7d4eaBeDc36e36260482
Private Key: 0x099359fa750740ba9896b779845327388549ccc87dc2ac35afdd802fa4336cb7
Balance: 8.9999474365 ETH
Token balance: 999900 MHT

Account 1: (bob)
Address:     0x3F9CD0795CCf3bEEd6fB510A2b0db6950696ea30
Private Key: 0xae14717942a76b675a1a32eae485510b1c859502fb02774391a16e03c816c5f2
Balance: 0.0 ETH
Token balance: 15 MHT

Account 2: (carol)
Address:     0x4605eC2552cB2433A9b4B83881dd2473C709b4e8
Private Key: 0x48dab7cf3c5d874f357c821691a6851021cdd5ddc07d97374a3debc813821546
Balance: 0.0 ETH
Token balance: 0 MHT
```

## Transfer between named accounts
Account aliases are defined in `hardhat.config.ts` and in `tests/constants.ts`

```ts
export const ACCOUNT_NAMES = ["alice", "bob", "carol", "dave", "eve", "fred", "greg", "hugo", "ian", "jane"];
```

```sh
pnpm task:transferBetweenNamedAccounts carol bob 1

> fhenix-hardhat-example@1.0.0 task:transferBetweenNamedAccounts /workspaces/fhenix-hardhat-example
> hardhat task:transferBetweenNamedAccounts "carol" "bob" "1"

Transferring 1 MHT from carol (0x4605eC2552cB2433A9b4B83881dd2473C709b4e8) to bob (0x3F9CD0795CCf3bEEd6fB510A2b0db6950696ea30)
Done!
$ pnpm task:listTokenBalance

> fhenix-hardhat-example@1.0.0 task:listTokenBalance /workspaces/fhenix-hardhat-example
> hardhat task:listTokenBalance


Account Details:
================

Account 0: (alice)
Address:     0xd7702EB6Ca4C101C918f7d4eaBeDc36e36260482
Private Key: 0x099359fa750740ba9896b779845327388549ccc87dc2ac35afdd802fa4336cb7
Balance: 9.9952768936 ETH
Token balance: 999990 MHT

Account 1: (bob)
Address:     0x3F9CD0795CCf3bEEd6fB510A2b0db6950696ea30
Private Key: 0xae14717942a76b675a1a32eae485510b1c859502fb02774391a16e03c816c5f2
Balance: 0.0 ETH
Token balance: 2 MHT

Account 2: (carol)
Address:     0x4605eC2552cB2433A9b4B83881dd2473C709b4e8
Private Key: 0x48dab7cf3c5d874f357c821691a6851021cdd5ddc07d97374a3debc813821546
Balance: 0.0 ETH
Token balance: 8 MHT
```

# Stopping localfhenix

RUn `pnpm localfhenix:stop` to stop the localfhenix. The state will be gone.

**DELETE** localhost from MetaMask to clear the cache from the old transactions done in the previous localfhenix instance. **Re-add** localhost to MetaMask the next time localfhenix is restarted.