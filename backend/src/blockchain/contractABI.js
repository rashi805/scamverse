/**
 * Human-readable ABI for ScamThreatRegistry.sol (Phase 4).
 * Kept in sync manually with blockchain/contracts/ScamThreatRegistry.sol.
 */
const registryABI = [
  'function admin() view returns (address)',
  'function roles(address) view returns (uint8)',
  'function addVerifier(address verifier)',
  'function removeVerifier(address verifier)',
  'function registerThreat(bytes32 threatId, bytes32 threatHash, string threatType)',
  'function verifyThreat(bytes32 threatId)',
  'function updateThreatStatus(bytes32 threatId, uint8 newStatus)',
  'function revokeThreat(bytes32 threatId)',
  'function getThreat(bytes32 threatId) view returns (tuple(bytes32 threatHash, string threatType, uint8 status, address reporter, uint256 timestamp, uint256 lastUpdated))',
  'function getThreatHistory(bytes32 threatId) view returns (tuple(uint8 status, uint256 timestamp, address changedBy)[])',
  'event ThreatRegistered(bytes32 indexed threatId, bytes32 threatHash, address indexed reporter)',
  'event ThreatVerified(bytes32 indexed threatId, address indexed verifier)',
  'event ThreatStatusUpdated(bytes32 indexed threatId, uint8 newStatus, address indexed changedBy)',
  'event ThreatRevoked(bytes32 indexed threatId, address indexed changedBy)',
  'event VerifierAdded(address indexed verifier)',
  'event VerifierRemoved(address indexed verifier)',
];

/**
 * Human-readable ABI for ScamCertificateSBT.sol (Phase 5 / Step 3).
 * Soulbound ERC-721 + ERC-5192 certificate NFT.
 */
const sbtABI = [
  'function admin() view returns (address)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function mintCertificate(address recipient, string metadataURI, bytes32 certificateHash) returns (uint256)',
  'function locked(uint256 tokenId) view returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getCertificate(uint256 tokenId) view returns (address recipient, bytes32 certificateHash, string metadataURI, uint256 timestamp)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function transferAdmin(address newAdmin)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Locked(uint256 indexed tokenId)',
  'event CertificateMinted(uint256 indexed tokenId, address indexed recipient, bytes32 certificateHash, string metadataURI)',
];

// Backward-compatible default export (registryABI) so existing code that does
// require('./contractABI') still works without modification.
module.exports = registryABI;
module.exports.registryABI = registryABI;
module.exports.sbtABI = sbtABI;

