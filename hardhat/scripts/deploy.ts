import { deploy } from "./utils";

const HERO_NOBOTS_MINTER_RELAYER_ADDRESS = process.env
  .HERO_NOBOTS_MINTER_RELAYER_ADDRESS as string;

async function main() {
  const hero = await deploy("Hero", [HERO_NOBOTS_MINTER_RELAYER_ADDRESS], true);
  await deploy("Guilds", [], true);
  await deploy("GuildsDAO", [hero.address], true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
