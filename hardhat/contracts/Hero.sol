// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Hero is ERC721, Ownable, EIP712, ERC721Votes, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Address of OZ Defender's Relayer
    address private immutable _defender;
    Counters.Counter private _tokenIdCounter;

    constructor(address defender) ERC721("Hero", "HERO") EIP712("Hero", "1") {
        require(defender != address(0));
        _defender = defender;
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

    function getCurrentTokenId() public view returns (uint256){
        return _tokenIdCounter.current();
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId);
    }
}
