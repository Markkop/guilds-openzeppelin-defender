import { ethers, upgrades } from "hardhat";
import { verify } from "./utils";

const HERO_NOBOTS_MINTER_RELAYER_ADDRESS = process.env
  .HERO_NOBOTS_MINTER_RELAYER_ADDRESS as string;

async function main() {
  const Hero = await ethers.getContractFactory("Hero");
  const hero = await upgrades.deployProxy(Hero, [
    HERO_NOBOTS_MINTER_RELAYER_ADDRESS,
  ]);

  await hero.deployed();
  console.log("Hero deployed to:", hero.address);

  const txReceipt = await hero.deployTransaction.wait(7);
  const heroProxiedContractAddress = ethers.utils.hexStripZeros(
    txReceipt.logs[0].topics[1]
  );
  await verify(heroProxiedContractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
