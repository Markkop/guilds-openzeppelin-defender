import { ethers, run, upgrades } from "hardhat";

export async function verify(
  contractAddress: string,
  constructorArguments: unknown[] = [],
  tryNumber = 1
): Promise<any> {
  try {
    return await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
  } catch (error: any) {
    if (error.toString().includes("Reason: Already Verified")) {
      console.log(error.name);
      return;
    }

    if (error.name.includes("does not have bytecode") && tryNumber <= 3) {
      console.log(`${error.name}\nTrying again...`);
      return verify(contractAddress, constructorArguments, tryNumber++);
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

export async function getDeployedContract(
  contractName: string,
  contractAddress: string
) {
  console.log(`Using ${contractName} from ${contractAddress}`);
  const Contract = await ethers.getContractFactory(contractName);
  const contract = Contract.attach(contractAddress);
  return contract;
}

export async function deployContracts(
  relayerAddress: string,
  autoAttackerAddress: string,
  verify: boolean
) {
  const hero = await deploy("Hero", [relayerAddress], false);
  const guilds = await deploy("Guilds", [autoAttackerAddress], verify);
  const guildsGovernor = await deploy("GuildsGovernor", [hero.address], false);
  return { hero, guilds, guildsGovernor };
}
