import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const privateKeys = [
  process.env.PRIVATE_KEY1 !== undefined && process.env.PRIVATE_KEY1,
  process.env.PRIVATE_KEY2 !== undefined && process.env.PRIVATE_KEY2,
  process.env.PRIVATE_KEY3 !== undefined && process.env.PRIVATE_KEY3,
  process.env.PRIVATE_KEY4 !== undefined && process.env.PRIVATE_KEY4,
].filter(Boolean) as string[];

const hasPrivateKeys = Boolean(privateKeys.length);

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: hasPrivateKeys ? privateKeys : undefined,
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts: hasPrivateKeys ? privateKeys : undefined,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
