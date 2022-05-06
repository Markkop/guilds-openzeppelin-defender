import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Guilds, GuildsDAO } from "../typechain";

export async function transferOwnershipAndProposeNewGuild(
  guilds: Guilds,
  guildsDAO: GuildsDAO,
  account1: SignerWithAddress
) {
  let tx = await guilds.transferOwnership(guildsDAO.address);
  await tx.wait();

  const guildName = ethers.utils.hexZeroPad(
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyGuild")),
    32
  );
  const encodedFunctionCall = guilds.interface.encodeFunctionData(
    "createGuild",
    [guildName, [account1.address]]
  );
  tx = await guildsDAO.propose(
    [guilds.address],
    [0],
    [encodedFunctionCall],
    "Create guild",
    {
      gasLimit: 3000000,
    }
  );
  return tx;
}
