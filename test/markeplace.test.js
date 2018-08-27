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