const Pokemon = artifacts.require("Pokemon");
module.exports = (deployer) => {
  deployer.deploy(Pokemon);
};
