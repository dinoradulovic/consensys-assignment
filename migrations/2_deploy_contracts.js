const Auth = artifacts.require("./Auth.sol");
const Marketplace = artifacts.require("./Marketplace.sol");

module.exports = function(deployer) {
  deployer.deploy(Auth)
    .then(() => {
      return deployer.deploy(Marketplace, Auth.address);
    })
};
