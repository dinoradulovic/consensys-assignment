const Auth = artifacts.require('Auth');

// for the error message in the third test
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/helpers/expectThrow.js#L16
require('chai').should();

contract('Auth', (accounts) => {

  describe('Admin management', function() {

    it('deployer of the contract should be the first admin', async () => {
      const contractDeployerAddress = accounts[0];

      const AuthContractInstance = await Auth.deployed();
      const isAdmin = await AuthContractInstance.admins(contractDeployerAddress);
      assert.isTrue(isAdmin);
    });

    it('should add admin successfully', async () => {
      const firstAdminCandidate = accounts[1];

      const AuthContractInstance = await Auth.deployed();
      await AuthContractInstance.addAdmin(firstAdminCandidate);
      const isAdmin = await AuthContractInstance.admins(firstAdminCandidate);

      assert.isTrue(isAdmin);
    });


    it('should throw an error when adding admin more than once', async () => {
      const alreadyAddedAdminAddress = accounts[0];

      const AuthContractInstance = await Auth.deployed();

      try {
        await AuthContractInstance.addAdmin(alreadyAddedAdminAddress);
      } catch (error) {
        error.message.should.include("VM Exception while processing transaction: revert")
      }
    });
  });

  describe('Store Owner management', function() {
    it('should add store owner successfully', async () => {

      const storeOwnerCandidate = accounts[2];

      const AuthContractInstance = await Auth.deployed();
      await AuthContractInstance.addStoreOwner(storeOwnerCandidate);
      const isStoreOwner = await AuthContractInstance.storeOwners(storeOwnerCandidate);

      assert.isTrue(isStoreOwner);
    });
  });

  describe('Emergency stop', function() {
    it('should pause contract successfully', async () => {
      const firstAdminCandidate = accounts[1];

      const AuthContractInstance = await Auth.deployed();
      await AuthContractInstance.pause();

      try {
        await AuthContractInstance.addAdmin(firstAdminCandidate);
      } catch (error) {
        error.message.should.include("VM Exception while processing transaction: revert")
      } finally {
        await AuthContractInstance.unpause();
      }
    });
  });



});
