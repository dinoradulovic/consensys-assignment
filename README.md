# Decentralized Marketplace (Solidity)

Consensys assignment.

## Requirements

    npm install -g ganache-cli
    npm install -g truffle

## Getting Started

- **`ganache-cli`**
- **`truffle compile`**
- **`truffle migrate`**
- **`npm i`**
- **`npm start`**

Open localhost:3000.

First address will be assigned to admin role. <br/>
Add a store owner.
<br/> Changing the account to store owner will redirect to store management page.
<br/>Add a store. Add a product to that store.
<br/>Change to another account - shopper acocunt --> the one that's not assigned yet.
<br/>Should be redirected automatically to page with shops.

## Testing

- **`truffle test`**

Following user stories are covered with tests:
- Marketplace owner and admins should be able to manage admins and store owners
- Admin should be able to manage stores and products inventory
- Regular users should be able to buy products
- Store owner should be able to withdraw balance from his store
- Contract owner should be able to pause the contract in emergency

I tried to cover as many guard checks as possible.
