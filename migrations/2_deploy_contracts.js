const Auth = artifacts.require("./Auth.sol");
const Marketplace = artifacts.require("./Marketplace.sol");

module.exports = function(deployer) {
  deployer.deploy(Auth);
  deployer.deploy(Marketplace);
};
