const { ethers } = require("ethers");
const {
  DefenderRelayProvider,
  DefenderRelaySigner
} = require('defender-relay-client/lib/ethers');

const contractAbi = ["function attackGuild(uint256 guildId) public"];

exports.handler = async function(event) {
  const { guildsContractAddress } = event.secrets;
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });
  const guildsContract = new ethers.Contract(guildsContractAddress, contractAbi, signer);
  const attackTx = await guildsContract.attackGuild(1);
  console.log(attackTx);
  return attackTx.hash;
}
