import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { getDeployedContract } from "../scripts/utils";
import { Guilds, GuildsDAO, Hero } from "../typechain";
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
  user: SignerWithAddress
) {
  const guildName = ethers.utils.hexZeroPad(
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyGuild")),
    32
  );
  const encodedFunctionCall = guilds.interface.encodeFunctionData(
    "createGuild",
    [guildName, [user.address]]
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
  const isHardhatNetwork = network.name === "hardhat";
  const confirmationBlocks = isHardhatNetwork ? undefined : 2;

  const txReceipt = await proposeTx.wait(confirmationBlocks);
  if (isHardhatNetwork) {
    await ethers.provider.send("evm_mine", []);
  }
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

export async function mintNFT(
  user: SignerWithAddress,
  relayer: SignerWithAddress,
  hero: Hero
) {
  const tokenId = await hero.getCurrentTokenId();
  const message = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "address"],
    [user.address, tokenId, hero.address]
  );
  const hash = ethers.utils.keccak256(message);
  const signature = await relayer.signMessage(ethers.utils.arrayify(hash));
  console.log(`Minting Hero NFT for ${user.address}...`);
  const mintTx = await hero
    .connect(user)
    .safeMint(user.address, hash, signature);
  const mintReceipt = await mintTx.wait();
  console.log(`Minting done`);
  return mintReceipt;
}

export async function vote(
  guildsDAO: GuildsDAO,
  user: SignerWithAddress,
  proposeId: BigNumber
) {
  console.log(`User ${user.address} is voting...`);
  const voteTx = await guildsDAO.connect(user).castVote(proposeId, 0, {
    gasLimit: 3000000,
  });
  const isHardhatNetwork = network.name === "hardhat";
  const confirmationBlocks = isHardhatNetwork ? undefined : 7;
  const voteReceipt = await voteTx.wait(confirmationBlocks);
  if (isHardhatNetwork) {
    await ethers.provider.send("evm_mine", []);
  }
  console.log("Voting complete");
  return voteReceipt;
}

export async function delegateVote(
  hero: Hero,
  user: SignerWithAddress,
  delegatedUser: SignerWithAddress
) {
  console.log("Delegating vote...");
  const delegateTx = await hero.connect(user).delegate(delegatedUser.address);
  const isHardhatNetwork = network.name === "hardhat";
  const confirmationBlocks = isHardhatNetwork ? undefined : 7;
  const delegateReceipt = await delegateTx.wait(confirmationBlocks);

  if (isHardhatNetwork) {
    await ethers.provider.send("evm_mine", []);
  }
  console.log("Vote delegated");
  return delegateReceipt;
}
