import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { deployContracts } from "../scripts/utils";
import { Guilds, GuildsGovernor, Hero } from "../typechain";
import { DeployedAddresses } from "../types";
import {
  getDeployedContracts,
  proposeCreateGuild,
  mintNFT,
  vote,
  delegateVote,
} from "./testUtils";

const deployedAddresses: DeployedAddresses = {
  hero: "0x339b264895a41e0c117bB4cf322DC723E6426118",
  guilds: "0xAe8235A2Ec4f54cf4CBe3219C027940872EbeAf4",
  guildsGovernor: "0x9404aA7C83E13748651176119c95A79270d94479",
};
const USE_DEPLOYED_CONTRACTS = false;

describe("Guilds Game", function () {
  this.timeout(600 * 1000);

  const VERIFY = network.name === "rinkeby";
  let deployer: SignerWithAddress;
  let relayer: SignerWithAddress;
  let autoAttacker: SignerWithAddress;
  let user: SignerWithAddress;
  let hero: Hero;
  let guilds: Guilds;
  let guildsGovernor: GuildsGovernor;

  this.beforeEach(async () => {
    [deployer, relayer, user, autoAttacker] = await ethers.getSigners();
    let contracts;
    const isHardhatNetwork = network.name === "hardhat";
    if (!isHardhatNetwork && USE_DEPLOYED_CONTRACTS) {
      contracts = await getDeployedContracts(deployedAddresses);
    } else {
      contracts = await deployContracts(
        relayer.address,
        autoAttacker.address,
        VERIFY
      );
    }
    hero = contracts.hero as Hero;
    guilds = contracts.guilds as Guilds;
    guildsGovernor = contracts.guildsGovernor as GuildsGovernor;
  });

  it("Should propose a new guild creation", async function () {
    const proposeTx = await proposeCreateGuild(guilds, guildsGovernor, user);
    await expect(proposeTx).to.not.be.reverted;
  });

  it("Should not be able to vote without an NFT", async function () {
    const proposeTx = await proposeCreateGuild(guilds, guildsGovernor, user);
    const eventLog = guildsGovernor.interface.parseLog(proposeTx.events![0]);
    const proposeId = eventLog.args[0] as BigNumber;
    const voteTx = await guildsGovernor.connect(user).castVote(proposeId, 0, {
      gasLimit: 3000000,
    });
    await voteTx.wait();

    const votes = await guildsGovernor.proposalVotes(proposeId);
    expect(votes.againstVotes.toNumber()).to.eql(0);
    expect(votes.forVotes.toNumber()).to.eql(0);
    expect(votes.abstainVotes.toNumber()).to.eql(0);
  });

  it("Shoud mint an NFT", async function () {
    await mintNFT(user, relayer, hero);
    expect((await hero.balanceOf(user.address)).toString()).to.eq("1");
  });

  it("Should vote after minting an NFT", async function () {
    await mintNFT(user, relayer, hero);
    await delegateVote(hero, user, user);
    const proposeTx = await proposeCreateGuild(
      guilds,
      guildsGovernor,
      deployer
    );
    const eventLog = guildsGovernor.interface.parseLog(proposeTx.events![0]);
    const proposeId = eventLog.args[0] as BigNumber;
    await vote(guildsGovernor, user, proposeId);

    const votes = await guildsGovernor.proposalVotes(proposeId);
    expect(votes.againstVotes.toNumber()).to.eql(1);
    expect(votes.forVotes.toNumber()).to.eql(0);
    expect(votes.abstainVotes.toNumber()).to.eql(0);
  });

  it("Should attack a guild", async function () {
    const guildName = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyGuild")),
      32
    );
    const createGuildTx = await guilds.createGuild(guildName, [user.address]);
    await createGuildTx.wait();

    const attackGuildTx = await guilds.connect(autoAttacker).attackGuild(1);
    await attackGuildTx.wait();

    const guildLife = await guilds.getGuildLife(1);
    expect(guildLife.toNumber()).to.eql(9);
  });
});
