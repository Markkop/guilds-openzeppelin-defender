// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Hero is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;

    address private _defender;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address defender) public initializer {
        require(defender != address(0), "Defender address can't be zero");
        _defender = defender;
        __ERC721_init("Hero", "HERO");
        __ERC721Enumerable_init();
        __Ownable_init();
    }

    function safeMint(
        address to,
        bytes32 hash,
        bytes memory signature
    ) 
        nonReentrant
        public 
    {
        uint256 tokenId = _tokenIdCounter.current();
        require(
            hash == keccak256(abi.encode(msg.sender, tokenId, address(this))),
            "Invalid hash"
        );
        require(
            ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), signature) == _defender,
            "Invalid signature"
        );
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function getCurrentTokenCount() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
