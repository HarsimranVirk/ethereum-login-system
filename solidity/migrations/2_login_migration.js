const Login = artifacts.require("Login");

module.exports = async function (deployer) {
  deployer.deploy(Login);
};
