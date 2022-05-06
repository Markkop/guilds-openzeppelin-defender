//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Guilds is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter public _guildIds;
    mapping(uint256 => Guild) public guildIdToGuild;

    struct Guild {
        uint256 guildId;
        bytes32 name;
        address[] members;
    }

    constructor() {
    }

    function createGuild(bytes32 name, address[] memory members) public onlyOwner {
        _guildIds.increment();
        uint256 guildId = _guildIds.current();

        guildIdToGuild[guildId] = Guild(
            guildId,
            name,
            members
        );
    }

    function getGuildMembers(uint256 guildId) public view returns (address[] memory) {
        return guildIdToGuild[guildId].members;
    }
}
