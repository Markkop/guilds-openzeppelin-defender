import { run } from "hardhat";

export async function verify(
  contractAddress: string,
  constructorArguments: string[] = []
) {
  return await run("verify:verify", {
    address: contractAddress,
    constructorArguments,
  });
}
