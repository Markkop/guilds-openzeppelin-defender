import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { deployContracts } from "../scripts/utils";
import { Guilds, GuildsDAO, Hero } from "../typechain";
import { DeployedAddresses } from "../types";
import {
  getDeployedContracts,
  transferGuildsOwnership,
  proposeCreateGuild,
} from "./testUtils";

const mockedDefenderAddress = "0x0000000000000000000000000000000000000001";
const deployedAddresses: DeployedAddresses = {
  hero: "0xC3FF677A18f8A2903cB8352Ff46D7787D7a31ffb",
  guilds: "0xAe8235A2Ec4f54cf4CBe3219C027940872EbeAf4",
  guildsDAO: "0x9404aA7C83E13748651176119c95A79270d94479",
};
const USE_DEPLOYED_CONTRACTS = true;

describe("GuildsDAO", function () {
  this.timeout(600 * 1000);

  const VERIFY = network.name === "rinkeby";
  let account1: SignerWithAddress;
  let hero: Hero;
  let guilds: Guilds;
  let guildsDAO: GuildsDAO;

  this.beforeEach(async () => {
    [account1] = await ethers.getSigners();
    let contracts;
    if (USE_DEPLOYED_CONTRACTS) {
      contracts = await getDeployedContracts(deployedAddresses);
    } else {
      contracts = await deployContracts(mockedDefenderAddress, VERIFY);
    }
    hero = contracts.hero as Hero;
    guilds = contracts.guilds as Guilds;
    guildsDAO = contracts.guildsDAO as GuildsDAO;
  });

  it("Should propose a new guild creation", async function () {
    const proposeTx = await proposeCreateGuild(guilds, guildsDAO, account1);
    await expect(proposeTx).to.not.be.reverted;
  });

  it.only("Should not be able to vote without an NFT", async function () {
    const proposeTx = await proposeCreateGuild(guilds, guildsDAO, account1);
    const eventLog = guildsDAO.interface.parseLog(proposeTx.events![0]);
    const proposeId = eventLog.args[0] as BigNumber;
    const voteTx = await guildsDAO.castVote(proposeId, 0, {
      gasLimit: 3000000,
    });
    await voteTx.wait();

    const votes = await guildsDAO.proposalVotes(proposeId);
    expect(votes.againstVotes.toNumber()).to.eql(0);
    expect(votes.forVotes.toNumber()).to.eql(0);
    expect(votes.abstainVotes.toNumber()).to.eql(0);
  });
});
