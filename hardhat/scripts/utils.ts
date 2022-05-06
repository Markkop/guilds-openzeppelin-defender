import { ethers, run, upgrades } from "hardhat";

export async function verify(
  contractAddress: string,
  constructorArguments: unknown[] = []
) {
  try {
    return await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
  } catch (error: any) {
    if (error.name.includes("Reason: Already Verified")) {
      console.log(error.name);
      return;
    }
    console.log(error);
  }
}

export async function deployProxy(
  contractName: string,
  args: unknown[],
  verification: boolean = false
) {
  console.log(`Deploying ${contractName}...`);
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(Contract, args);

  await contract.deployed();
  console.log(`${contractName} deployed to:`, contract.address);

  if (verification) {
    const transactionConfirmations = 7;
    console.log(
      `Waiting for ${transactionConfirmations} deploy transaction confirmations...`
    );
    const txReceipt = await contract.deployTransaction.wait(
      transactionConfirmations
    );
    const proxiedContractAddress = ethers.utils.hexStripZeros(
      txReceipt.logs[0].topics[1]
    );
    await verify(contract.address);
    await verify(proxiedContractAddress);
  }
  return contract;
}

export async function deploy(
  contractName: string,
  args: unknown[],
  verification: boolean = false
) {
  console.log(`Deploying ${contractName}...`);
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);

  await contract.deployed();
  console.log(`${contractName} deployed to:`, contract.address);

  if (verification) {
    const transactionConfirmations = 7;
    console.log(
      `Waiting for ${transactionConfirmations} deploy transaction confirmations...`
    );
    await contract.deployTransaction.wait(transactionConfirmations);
    await verify(contract.address, args);
  }
  return contract;
}
