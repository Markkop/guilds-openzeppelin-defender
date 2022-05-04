import { ethers, upgrades } from "hardhat";
import { verify } from "./utils";

const HERO_NOBOTS_MINTER_RELAYER_ADDRESS = process.env
  .HERO_NOBOTS_MINTER_RELAYER_ADDRESS as string;

async function deployProxy(
  contractName: string,
  args: unknown[],
  verification: boolean = false
) {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(Contract, args);

  await contract.deployed();
  console.log(`${contractName} deployed to:`, contract.address);

  if (verification) {
    const txReceipt = await contract.deployTransaction.wait(7);
    const proxiedContractAddress = ethers.utils.hexStripZeros(
      txReceipt.logs[0].topics[1]
    );
    await verify(contract.address);
    await verify(proxiedContractAddress);
  }
  return contract;
}

async function main() {
  const hero = await deployProxy(
    "Hero",
    [HERO_NOBOTS_MINTER_RELAYER_ADDRESS],
    false
  );
  await deployProxy("Guilds", [hero.address], true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
