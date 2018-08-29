const Marketplace = artifacts.require('Marketplace');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

contract('Marketplace', (accounts) => {
  describe('Store management', function () {

    it('should add store', async () => {
      const storeOwner = accounts[1];
      const MarketplaceContractInstance = await Marketplace.deployed();

      const preStoresCount = await MarketplaceContractInstance.storesCountByAccount(storeOwner);
      await MarketplaceContractInstance.addStore({from: storeOwner});
      const postStoresCount  = await MarketplaceContractInstance.storesCountByAccount(storeOwner);

      assert.isTrue(preStoresCount < postStoresCount);
    });

    it('should add product to store', async () => {
      const storeOwner = accounts[1];
      const MarketplaceContractInstance = await Marketplace.deployed();

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const storeId =  await MarketplaceContractInstance.storeIdGenerator();

      const preProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      await MarketplaceContractInstance.addProductToStore(
        storeId, 'Some product name', web3.toWei(1, 'ether'),
        {from: storeOwner});

      const postProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      assert.isTrue(preProductsCount < postProductsCount);
    });


    it('should remove product from the store', async () => {
      const storeOwner = accounts[1];
      const MarketplaceContractInstance = await Marketplace.deployed();

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const storeId =  await MarketplaceContractInstance.storeIdGenerator();
      await MarketplaceContractInstance.addProductToStore(
        storeId, 'Some product name', web3.toWei(1, 'ether'),
        {from: storeOwner});

      const preProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      await MarketplaceContractInstance.removeProductFromStore(storeId, 0, {
        from: storeOwner
      });

      const postProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      assert.isTrue(preProductsCount > postProductsCount);

    });

    it('should update product price', async () => {
      const storeOwner = accounts[1];
      const MarketplaceContractInstance = await Marketplace.deployed();

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const storeId = await MarketplaceContractInstance.storeIdGenerator();

      await MarketplaceContractInstance.addProductToStore(
        storeId, 'Some product name', web3.toWei(1, 'ether'),
        {from: storeOwner});
      const productId = await MarketplaceContractInstance.productsCount(storeId);

      await MarketplaceContractInstance.updateProductPrice(
        storeId,
        productId,
        web3.toWei(2, 'ether'),
      );

      const product = await MarketplaceContractInstance.productById(productId);

      assert.isTrue(product[3].toString() === web3.toWei(2, 'ether'));
    });


  });


  describe('Balance transfers', function () {
    it('should buy product', async () => {
      const storeOwner = accounts[1];
      const MarketplaceContractInstance = await Marketplace.deployed();

      await MarketplaceContractInstance.addStore({from: storeOwner});

      const storeIdGenerator = await MarketplaceContractInstance.storeIdGenerator();
      const storeId = storeIdGenerator.toNumber();

      await MarketplaceContractInstance.addProductToStore(
        storeId,
        'Some product name',
        web3.toWei(1, 'ether'),
        {
          from: storeOwner
        });

      const productId = await MarketplaceContractInstance.productsCount(storeId);
      const product = await MarketplaceContractInstance.productById(productId);

      const storeBalanceBeforePurchase = await MarketplaceContractInstance.getStoreBalance(storeId);
      await MarketplaceContractInstance.buyProduct(productId, storeId);
      const storeBalanceAfterPurchase = await MarketplaceContractInstance.getStoreBalance(storeId);

      assert.isTrue(storeBalanceAfterPurchase.toNumber() === storeBalanceBeforePurchase.toNumber() + product[3].toNumber());
    });

    it('store owner should be able to withdraw funds', async () => {
      const storeOwner = accounts[1];
      const shopperOne = accounts[2];
      const storeOwnerTwo = accounts[3];
      const MarketplaceContractInstance = await Marketplace.deployed();

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const storeIdGenerator = await MarketplaceContractInstance.storeIdGenerator();
      const storeId = storeIdGenerator.toNumber();


      await MarketplaceContractInstance.addStore({from: storeOwner});
      const secondStoreIdGen = await MarketplaceContractInstance.storeIdGenerator()
      const secondStoreId = secondStoreIdGen.toNumber();


      await MarketplaceContractInstance.addProductToStore(
        storeId,
        'Some product name',
        web3.toWei(1, 'ether'),
        {
          from: storeOwner
        });

      const productId = await MarketplaceContractInstance.productsCount(storeId);
      const product = await MarketplaceContractInstance.productById(productId);
      const productPrice = product[3];


      const shopperOneBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(shopperOne));
      const contractBalanceBeforeBuy = web3.eth.getBalance(MarketplaceContractInstance.address).toNumber();


      await MarketplaceContractInstance.addProductToStore(
        secondStoreId,
        'Some other product name',
        web3.toWei(1, 'ether'),
        {
          from: storeOwnerTwo
        });

      const secondProductId = await MarketplaceContractInstance.productsCount(secondStoreId);
      const secondProduct = await MarketplaceContractInstance.productById(secondProductId);
      const secondProductPrice = secondProduct[3];

      await MarketplaceContractInstance.buyProduct(secondProductId, secondStoreId, {
        from: shopperOne,
        value: secondProductPrice
      });

      await MarketplaceContractInstance.buyProduct(productId, storeId, {
        from: shopperOne,
        value: productPrice
      });

      await MarketplaceContractInstance.buyProduct(productId, storeId, {
        from: shopperOne,
        value: productPrice
      });


      const shopperOneBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(shopperOne), 'ether');
      const contractBalanceAfterBuy = web3.eth.getBalance(MarketplaceContractInstance.address).toNumber();

      assert.isBelow(parseInt(shopperOneBalanceAfterBuy), parseInt(shopperOneBalanceBeforeBuy));
      assert.isBelow(contractBalanceBeforeBuy, contractBalanceAfterBuy);


      const storeOwnerBalance = web3.fromWei(web3.eth.getBalance(storeOwner)).toNumber();
      const storeBalance = await MarketplaceContractInstance.getStoreBalance(storeId);

      await MarketplaceContractInstance.withdrawFromStore(storeId, storeBalance, {from: storeOwner});

      const storeOwnerBalanceAfterTransfer = web3.fromWei(web3.eth.getBalance(storeOwner)).toNumber();
      const contractBalanceAfterTransfer = web3.eth.getBalance(MarketplaceContractInstance.address).toNumber();

      assert.isTrue(storeOwnerBalanceAfterTransfer > storeOwnerBalance);
      assert.isTrue(contractBalanceAfterBuy > contractBalanceAfterTransfer);
      assert.isTrue(secondProductPrice == contractBalanceAfterTransfer);
    });
  });
});