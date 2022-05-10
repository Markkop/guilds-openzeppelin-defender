//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Guilds is Ownable, AccessControl {
    using Counters for Counters.Counter;
    bytes32 public constant AUTO_ATTACKER_ROLE = keccak256("AUTO_ATTACKER_ROLE");

    Counters.Counter public _guildIds;
    mapping(uint256 => Guild) public guildIdToGuild;

    struct Guild {
        uint256 guildId;
        bytes32 name;
        address[] members;
        uint256 maxLife;
        uint256 currentLife;
    }

    constructor(address autoAttackerAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTO_ATTACKER_ROLE, autoAttackerAddress);
    }

    function createGuild(bytes32 name, address[] memory members) public onlyOwner {
        _guildIds.increment();
        uint256 guildId = _guildIds.current();

        guildIdToGuild[guildId] = Guild(
            guildId,
            name,
            members,
            10,
            10
        );
    }

    function getGuildMembers(uint256 guildId) public view returns (address[] memory) {
        return guildIdToGuild[guildId].members;
    }

    function attackGuild(uint256 guildId) public onlyRole(AUTO_ATTACKER_ROLE) {
        Guild storage guild = guildIdToGuild[guildId];
        require(guild.currentLife > 0, "Guild is dead");
        guild.currentLife -= 1;
    }

    function getGuildLife(uint256 guildId) public view returns (uint256) {
        return guildIdToGuild[guildId].currentLife;
    }
}
