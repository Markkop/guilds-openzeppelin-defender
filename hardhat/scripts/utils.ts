import { run } from "hardhat";

export async function verify(
  contractAddress: string,
  constructorArguments: string[] = []
) {
  try {
    return await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
  } catch (error) {
    console.log(error);
  }
}
