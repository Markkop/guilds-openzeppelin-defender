# 🏰 Guilds NFT Game + OpenZeppelin Defender

[![https://img.shields.io/static/v1?label=feat.&message=OpenZeppelin%20Defender&color=4e5ee4](https://img.shields.io/static/v1?label=feat.&message=OpenZeppelin%20Defender&color=4e5ee4)](https://www.openzeppelin.com/defender)

This demo project is part of the "Discovering OpenZeppelin Defender features with an NFT Game" blog post where I show how OpenZeppelin Defender can be used to manage a descentralized application.

## Features

### 🤖 Anti-bot NFT minting

With Defender's Relay and Autotask, a captcha challenge protection is used to prevent bots from minting NFTs.  
It's relevant in this application since each NFT gives the user voting power.  
(Based on [tinchoabbate's implementation](https://forum.openzeppelin.com/t/human-first-nft-mints/21921))

### 🏛️ Governance

Using Defender's Admin, it's possible to create proposals on a Governor contract.  
In this project, this feature is demonstrated by creating new guilds in the game.  

### 🕒 Scheduled contract interaction

Combining Relay and Autotask again, the game system can auto attack guilds in a given interval of time.


