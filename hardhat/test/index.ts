import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { deploy } from "../scripts/utils";
import { Guilds, GuildsDAO, Hero } from "../typechain";
import { transferOwnershipAndProposeNewGuild } from "./testUtils";

describe("GuildsDAO", function () {
  this.timeout(240 * 1000);

  const VERIFY = network.name === "rinkeby";
  let account1: SignerWithAddress;
  let hero: Hero;
  let guilds: Guilds;
  let guildsDAO: GuildsDAO;

  this.beforeEach(async () => {
    [account1] = await ethers.getSigners();
    hero = (await deploy(
      "Hero",
      ["0x0000000000000000000000000000000000000001"], // Random address to mock defender's address
      VERIFY
    )) as unknown as Hero;
    guilds = (await deploy("Guilds", [], VERIFY)) as unknown as Guilds;
    guildsDAO = (await deploy(
      "GuildsDAO",
      [hero.address],
      VERIFY
    )) as unknown as GuildsDAO;
  });

  it("Should propose a new guild creation", async function () {
    const proposeTx = await transferOwnershipAndProposeNewGuild(
      guilds,
      guildsDAO,
      account1
    );
    await expect(proposeTx.wait()).to.not.be.reverted;
  });
});
