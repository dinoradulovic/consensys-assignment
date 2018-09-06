const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const Marketplace = artifacts.require('Marketplace');
const Auth = artifacts.require('Auth');


contract('Marketplace', (accounts) => {
  const admin = accounts[1];
  const storeOwner = accounts[2];
  const storeOwnerTwo = accounts[3];
  let AuthContractInstance;
  let MarketplaceContractInstance;

  describe('Store management', function () {

    before(async () => {
      AuthContractInstance = await Auth.new();
      MarketplaceContractInstance = await Marketplace.new(AuthContractInstance.address);

      await AuthContractInstance.addAdmin(admin);
      await AuthContractInstance.addStoreOwner(storeOwner);
      await AuthContractInstance.addStoreOwner(storeOwnerTwo);
    });

    it('should add store', async () => {
      const preStoresCount = await MarketplaceContractInstance.storesCountByAccount(storeOwner);
      await MarketplaceContractInstance.addStore({from: storeOwner});
      const postStoresCount  = await MarketplaceContractInstance.storesCountByAccount(storeOwner);

      assert.isTrue(preStoresCount < postStoresCount);
    });

    it('should add product to store', async () => {
      const storeId =  await MarketplaceContractInstance.storeIdGenerator();
      const productName = "Some Product Name";
      const productPrice = web3.toWei(1, 'ether');
      const productImage = web3.fromAscii("QmV8RCYpxrqf5tL5b17gd76newKvDXAfbGJXF1Fo1Qnj3W");

      const preProductsCount = await MarketplaceContractInstance.productsCount(storeId);
      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, productPrice, productImage,
        { from: storeOwner });
      const postProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      assert.isTrue(preProductsCount < postProductsCount);
    });


    it('should remove product from the store', async () => {
      const storeId =  await MarketplaceContractInstance.storeIdGenerator();
      const productName = "Some Product Name";
      const productPrice = web3.toWei(1, 'ether');
      const productImage = web3.fromAscii("QmV8RCYpxrqf5tL5b17gd76newKvDXAfbGJXF1Fo1Qnj3W");

      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, productPrice, productImage,
        { from: storeOwner });
      const preProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      await MarketplaceContractInstance.removeProductFromStore(storeId, 0, {
        from: storeOwner
      });

      const postProductsCount = await MarketplaceContractInstance.productsCount(storeId);

      assert.isTrue(preProductsCount > postProductsCount);

    });

    it('should update product price', async () => {
      const storeId = await MarketplaceContractInstance.storeIdGenerator();
      const productName = "Some Product Name";
      const productPrice = web3.toWei(1, 'ether');
      const productImage = web3.fromAscii("QmV8RCYpxrqf5tL5b17gd76newKvDXAfbGJXF1Fo1Qnj3W");

      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, productPrice, productImage,
        { from: storeOwner });

      const productId = await MarketplaceContractInstance.productsCount(storeId);

      await MarketplaceContractInstance.updateProductPrice(
        storeId,
        productId,
        web3.toWei(2, 'ether'),
        {from: storeOwner});

      const product = await MarketplaceContractInstance.productById(productId);

      assert.isTrue(product[3].toString() === web3.toWei(2, 'ether'));
    });
  });


  describe('Balance transfers', function () {
    it('should buy product', async () => {

      const storeIdGenerator = await MarketplaceContractInstance.storeIdGenerator();
      const storeId = storeIdGenerator.toNumber();
      const productName = "Some Product Name";
      const productPrice = web3.toWei(1, 'ether');
      const productImage = web3.fromAscii("QmV8RCYpxrqf5tL5b17gd76newKvDXAfbGJXF1Fo1Qnj3W");

      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, productPrice, productImage,
        { from: storeOwner });

      const productId = await MarketplaceContractInstance.productsCount(storeId);
      const product = await MarketplaceContractInstance.productById(productId);

      const storeBalanceBeforePurchase = await MarketplaceContractInstance.getStoreBalance(storeId);
      await MarketplaceContractInstance.buyProduct(productId, storeId);
      const storeBalanceAfterPurchase = await MarketplaceContractInstance.getStoreBalance(storeId);

      assert.isTrue(storeBalanceAfterPurchase.toNumber() === storeBalanceBeforePurchase.toNumber() + product[3].toNumber());
    });

    it('store owner should be able to withdraw funds', async () => {
      const buyer = accounts[6];

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const storeIdGenerator = await MarketplaceContractInstance.storeIdGenerator();
      const storeId = storeIdGenerator.toNumber();

      await MarketplaceContractInstance.addStore({from: storeOwner});
      const secondStoreIdGen = await MarketplaceContractInstance.storeIdGenerator();
      const secondStoreId = secondStoreIdGen.toNumber();

      const productName = "Some Product Name";
      const someProductPrice = web3.toWei(1, 'ether');
      const productImage = web3.fromAscii("QmV8RCYpxrqf5tL5b17gd76newKvDXAfbGJXF1Fo1Qnj3W");

      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, someProductPrice, productImage,
        { from: storeOwner });

      const productId = await MarketplaceContractInstance.productsCount(storeId);
      const product = await MarketplaceContractInstance.productById(productId);
      const productPrice = product[3];

      const buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer));
      const contractBalanceBeforeBuy = web3.eth.getBalance(MarketplaceContractInstance.address).toNumber();

      await MarketplaceContractInstance.addProductToStore(
        storeId, productName, productPrice, productImage,
        { from: storeOwner });

      const secondProductId = await MarketplaceContractInstance.productsCount(secondStoreId);
      const secondProduct = await MarketplaceContractInstance.productById(secondProductId);
      const secondProductPrice = secondProduct[3];

      await MarketplaceContractInstance.buyProduct(secondProductId, secondStoreId, {
        from: buyer,
        value: secondProductPrice
      });

      await MarketplaceContractInstance.buyProduct(productId, storeId, {
        from: buyer,
        value: productPrice
      });

      await MarketplaceContractInstance.buyProduct(productId, storeId, {
        from: buyer,
        value: productPrice
      });


      const buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether');
      const contractBalanceAfterBuy = web3.eth.getBalance(MarketplaceContractInstance.address).toNumber();

      assert.isBelow(parseInt(buyerBalanceAfterBuy), parseInt(buyerBalanceBeforeBuy));
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