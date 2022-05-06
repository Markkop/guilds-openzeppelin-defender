import { deployContracts } from "./utils";

const HERO_NOBOTS_MINTER_RELAYER_ADDRESS = process.env
  .HERO_NOBOTS_MINTER_RELAYER_ADDRESS as string;

async function main() {
  await deployContracts(HERO_NOBOTS_MINTER_RELAYER_ADDRESS, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
