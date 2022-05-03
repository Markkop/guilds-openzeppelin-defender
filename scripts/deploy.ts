import { ethers, run } from "hardhat";

async function verify(contractAddress: string) {
  return await run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });
}

async function main() {
  const Hero = await ethers.getContractFactory("Hero");
  const hero = await Hero.deploy();
  await hero.deployed();
  console.log("Hero deployed to:", hero.address);

  await hero.deployTransaction.wait(7);
  await verify(hero.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
