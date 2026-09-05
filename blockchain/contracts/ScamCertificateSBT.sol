// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * SCAMVERSE 360 - Soulbound Certificate NFT (Phase 5 / Step 3)
 *
 * Implements ERC-721 (minimal, no OpenZeppelin dependency) with
 * ERC-5192 soulbound semantics: locked() always returns true and
 * all transfer functions permanently revert.
 *
 * Only the contract admin can mint certificates.
 * ERC-5192: https://eips.ethereum.org/EIPS/eip-5192
 * Interface ID: 0xb45a3c0e
 */
contract ScamCertificateSBT {
    bytes4 private constant INTERFACE_ERC165  = 0x01ffc9a7;
    bytes4 private constant INTERFACE_ERC721  = 0x80ac58cd;
    bytes4 private constant INTERFACE_ERC721_METADATA = 0x5b5e139f;
    bytes4 private constant INTERFACE_ERC5192 = 0xb45a3c0e;

    string public name   = "SCAMVERSE 360 Certificate";
    string public symbol = "SV360CERT";

    address public admin;
    uint256 private _nextTokenId;

    struct CertRecord {
        address recipient;
        bytes32 certificateHash;
        string  metadataURI;
        uint256 timestamp;
    }

    mapping(uint256 => CertRecord) private _certs;
    mapping(uint256 => address)    private _owners;
    mapping(address => uint256)    private _balances;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event Locked(uint256 indexed tokenId);
    event CertificateMinted(uint256 indexed tokenId, address indexed recipient, bytes32 certificateHash, string metadataURI);

    modifier onlyAdmin() {
        require(msg.sender == admin, "SBT: only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        _nextTokenId = 1;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "SBT: zero address");
        admin = newAdmin;
    }

    function mintCertificate(
        address recipient,
        string calldata metadataURI,
        bytes32 certificateHash
    ) external onlyAdmin returns (uint256 tokenId) {
        require(recipient != address(0), "SBT: mint to zero address");
        tokenId = _nextTokenId++;
        _owners[tokenId] = recipient;
        _balances[recipient] += 1;
        _certs[tokenId] = CertRecord({
            recipient: recipient,
            certificateHash: certificateHash,
            metadataURI: metadataURI,
            timestamp: block.timestamp
        });
        emit Transfer(address(0), recipient, tokenId);
        emit Locked(tokenId);
        emit CertificateMinted(tokenId, recipient, certificateHash, metadataURI);
    }

    function locked(uint256 tokenId) external view returns (bool) {
        require(_owners[tokenId] != address(0), "SBT: token does not exist");
        return true;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "SBT: zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "SBT: token does not exist");
        return owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "SBT: token does not exist");
        return _certs[tokenId].metadataURI;
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_owners[tokenId] != address(0), "SBT: token does not exist");
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert("SBT: non-transferable");
    }

    function approve(address, uint256) external pure {
        revert("SBT: non-transferable");
    }

    function setApprovalForAll(address, bool) external pure {
        revert("SBT: non-transferable");
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == INTERFACE_ERC165 ||
            interfaceId == INTERFACE_ERC721 ||
            interfaceId == INTERFACE_ERC721_METADATA ||
            interfaceId == INTERFACE_ERC5192;
    }

    function getCertificate(uint256 tokenId)
        external
        view
        returns (address recipient, bytes32 certificateHash, string memory metadataURI, uint256 timestamp)
    {
        require(_owners[tokenId] != address(0), "SBT: token does not exist");
        CertRecord memory r = _certs[tokenId];
        return (r.recipient, r.certificateHash, r.metadataURI, r.timestamp);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
