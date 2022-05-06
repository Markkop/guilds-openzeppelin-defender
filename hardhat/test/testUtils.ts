import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { getDeployedContract } from "../scripts/utils";
import { Guilds, GuildsDAO } from "../typechain";
import { DeployedAddresses } from "../types";

export async function transferGuildsOwnership(
  guilds: Guilds,
  guildsDAO: GuildsDAO
) {
  console.log(`Transfering Guilds ownership to ${guildsDAO.address}...`);
  const transferTx = await guilds.transferOwnership(guildsDAO.address);
  await transferTx.wait();
  console.log("Ownership transferred!");
}

export async function proposeCreateGuild(
  guilds: Guilds,
  guildsDAO: GuildsDAO,
  account1: SignerWithAddress
) {
  const guildName = ethers.utils.hexZeroPad(
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyGuild")),
    32
  );
  const encodedFunctionCall = guilds.interface.encodeFunctionData(
    "createGuild",
    [guildName, [account1.address]]
  );
  console.log("Proposing a new guild with createGuild...");
  const proposeTx = await guildsDAO.propose(
    [guilds.address],
    [0],
    [encodedFunctionCall],
    "Create guild" + Date.now().toString(),
    {
      gasLimit: 3000000,
    }
  );
  const txReceipt = proposeTx.wait(2);
  console.log("Proposal created!");
  return txReceipt;
}

export async function getDeployedContracts(
  deployedAddresses: DeployedAddresses
) {
  const hero = await getDeployedContract("Hero", deployedAddresses.hero);
  const guilds = await getDeployedContract("Guilds", deployedAddresses.guilds);
  const guildsDAO = await getDeployedContract(
    "GuildsDAO",
    deployedAddresses.guildsDAO
  );
  return { hero, guilds, guildsDAO };
}
