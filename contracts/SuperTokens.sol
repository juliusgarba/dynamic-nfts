// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

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
        uint256 commentCount;
    }

    struct Comment {
        address sender;
        string content;
    }

    mapping(uint256 => mapping(address => uint256)) internal reactions;
    mapping(uint256 => Comment[]) internal comments;
    mapping(uint256 => Token) internal tokens;

    constructor() ERC721("Super Tokens", "SUT") {}

    modifier validTokenId(uint _tokenId){
        require(
            _tokenId < _tokenIdCounter.current(),
            "Invalid token ID entered"
        );
        _;
    }

    modifier notOwner(uint _tokenId){
        require(ownerOf(_tokenId) != msg.sender, "owner can't perform this action");
        _;
    }

    function mint(string memory _tokenURI, uint256 id) private {
        _safeMint(msg.sender, id);
        _setTokenURI(id, _tokenURI);
    }

    // mint an NFT character
    function mintCharacter(string memory _tokenURI) public {
        require(bytes(_tokenURI).length > 7, "Enter a valid token uri"); //ipfs uri starts with "ipfs://"
        uint256 id = _tokenIdCounter.current();
        // Mint new token and add to blockchain
        mint(_tokenURI, id);
        // Create token object
        tokens[id] = Token(id, 0, 0, 0, 0);
        _tokenIdCounter.increment();
    }

    // Add a reaction to a token
    function addReaction(uint256 tokenId, uint256 reactionId) public validTokenId(tokenId) notOwner(tokenId){
        // 1 - Like reaction
        // 2 - Happy reaction
        // 3 - Angry reaction

        require(
            reactionId == 1 || reactionId == 2 || reactionId == 3,
            "Invalid reaction entered"
        );

        uint currentReaction =  reactions[tokenId][msg.sender];
        Token storage token = tokens[tokenId];

        require(currentReaction != reactionId, "already reacted");

        //First remove the current reaction
        if(currentReaction != 0){
            if (currentReaction == 1) {
                token.likeCount -= 1;
            } else if (currentReaction == 2) {
                token.happyCount -= 1;
            } else if (currentReaction == 3) {
                token.angryCount -= 1;
            }
        }

        //Then add the new reaction
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

    // Add a new comment to tokens
    function addComment(uint256 tokenId, string calldata content) public validTokenId(tokenId) notOwner(tokenId){
        require(bytes(content).length > 0, "invalid comment");
        Token storage token = tokens[tokenId];
        Comment memory newComment = Comment(msg.sender, content);
        comments[tokenId].push(newComment);
        token.commentCount += 1;
    }

    // Get token character from contract
    function getToken(uint256 _tokenId)
        public
        view
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

    // Get comments of a particular token character
    function getComment(uint256 _tokenId)
        public
        view
        returns (Comment[] memory)
    {
        Token memory _token = tokens[_tokenId];
        uint256 commentCount = _token.commentCount;
        Comment[] memory _comments = new Comment[](commentCount);
        for (uint256 i = 0; i < commentCount; i++) {
            _comments[i] = comments[_tokenId][i];
        }

        return _comments;
    }

    // Check which reaction a user made on a token character
    function whichReaction(uint256 _tokenId) public view validTokenId(_tokenId) returns (uint256){
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
