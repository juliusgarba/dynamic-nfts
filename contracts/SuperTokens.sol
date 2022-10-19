// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SuperTokens is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Token {
        uint256 tokenId;
        uint256 likeCount;
        uint256 happyCount;
        uint256 angryCount;
    }

    struct Comment {
        address sender;
        string content;
    }

    mapping(uint256 => mapping(address => uint256)) private reactions;
    mapping(uint256 => Comment[]) private comments;
    mapping(uint256 => Token) private tokens;

    enum Reaction{
        UNDEFINED,
        LIKES,
        HAPPY,
        ANGRY
    }

    constructor() ERC721("Super Tokens", "SUT") {}


    modifier exists(uint _tokenId){
        require(_exists(_tokenId), "Query of nonexistent token");
        _;
    }

    /// @dev mints an NFT character
    /// @notice Token's uri needs to be a nonempty and valid value
    function mintCharacter(string calldata _tokenURI) public  {
        require(bytes(_tokenURI).length > 8, "Enter a valid token uri"); //ipfs uri generated on the frontend starts with "https://"
        uint256 id = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        // Mint new token and add to blockchain
        _safeMint(msg.sender, id);
        _setTokenURI(id, _tokenURI);
        // Create token object
        tokens[id] = Token(id, 0, 0, 0);
        
    }

    /// @dev Add a reaction to a token
    /// @notice You can only add one reaction per Character. The choosen reaction is permanent and can't be modified
    /// @notice Reactions available are: Like, Happy and Angry. Choosing other types of reactions will be rejected
    function addReaction(uint256 tokenId, uint256 reactionId) public exists(tokenId){
        // 1 - Like reaction
        // 2 - Happy reaction
        // 3 - Angry reaction

        require(
            reactionId == uint(Reaction.LIKES) || reactionId == uint(Reaction.HAPPY) || reactionId == uint(Reaction.ANGRY),
            "Invalid reaction entered"
        );
        require(
            reactions[tokenId][msg.sender] == 0,
            "Already reacted to this token"
        );

        Token storage token = tokens[tokenId];
        if (reactionId == 1) {
            token.likeCount += 1;
        } else if (reactionId == 2) {
            token.happyCount += 1;
        } else if (reactionId == 3) {
            token.angryCount += 1;
        }

        // Track of sender's reaction
        reactions[tokenId][msg.sender] = reactionId;
    }

    /// @dev Add a new comment to token
    function addComment(uint256 tokenId, string calldata content) public exists(tokenId) {
        require(bytes(content).length > 0, "Content for comment can't be empty");
        comments[tokenId].push(Comment(msg.sender, content));
    }

    // Get token character from contract
    function getToken(uint256 _tokenId)
        public
        view
        exists(_tokenId)
        returns (
            string memory _tokenURI,
            address owner,
            uint256 likeCount,
            uint256 happyCount,
            uint256 angryCount
        )
    {
        Token memory _token = tokens[_tokenId];
        likeCount = _token.likeCount;
        happyCount = _token.happyCount;
        angryCount = _token.angryCount;
        _tokenURI = tokenURI(_tokenId);
        owner = ownerOf(_tokenId);
    }

    /// @dev Get comments of a particular token character
    function getComment(uint256 _tokenId)
        public
        view
        exists(_tokenId)
        returns (Comment[] memory)
    {
        return comments[_tokenId];
    }

    /// @dev Check which reaction a user made on a token character
    function whichReaction(uint256 _tokenId) public view exists(_tokenId) returns (uint256) {
        return reactions[_tokenId][msg.sender];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
