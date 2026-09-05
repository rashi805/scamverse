// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * SCAMVERSE 360 - Threat Registry (Phase 4 scaffold)
 * Stores only hashes / metadata references, never raw private data.
 */
contract ScamThreatRegistry {
    enum Status { Pending, Suspicious, Verified, Expired, Revoked, Archived }
    enum Role { None, Reporter, Verifier, Admin }

    struct Threat {
        bytes32 threatHash;
        string threatType;
        Status status;
        address reporter;
        uint256 timestamp;
        uint256 lastUpdated;
    }

    struct StatusChange {
        Status status;
        uint256 timestamp;
        address changedBy;
    }

    address public admin;
    mapping(address => Role) public roles;
    mapping(bytes32 => Threat) public threats; // keyed by threatId (hash of hash+salt)
    mapping(bytes32 => StatusChange[]) public threatHistory;

    event ThreatRegistered(bytes32 indexed threatId, bytes32 threatHash, address indexed reporter);
    event ThreatVerified(bytes32 indexed threatId, address indexed verifier);
    event ThreatStatusUpdated(bytes32 indexed threatId, Status newStatus, address indexed changedBy);
    event ThreatRevoked(bytes32 indexed threatId, address indexed changedBy);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyVerifier() {
        require(roles[msg.sender] == Role.Verifier || msg.sender == admin, "Only verifier");
        _;
    }

    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Admin;
    }

    function addVerifier(address verifier) external onlyAdmin {
        roles[verifier] = Role.Verifier;
        emit VerifierAdded(verifier);
    }

    function removeVerifier(address verifier) external onlyAdmin {
        roles[verifier] = Role.None;
        emit VerifierRemoved(verifier);
    }

    function registerThreat(bytes32 threatId, bytes32 threatHash, string calldata threatType) external {
        require(threats[threatId].timestamp == 0, "Threat already exists");
        threats[threatId] = Threat({
            threatHash: threatHash,
            threatType: threatType,
            status: Status.Pending,
            reporter: msg.sender,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp
        });
        threatHistory[threatId].push(StatusChange(Status.Pending, block.timestamp, msg.sender));
        emit ThreatRegistered(threatId, threatHash, msg.sender);
    }

    function verifyThreat(bytes32 threatId) external onlyVerifier {
        require(threats[threatId].timestamp != 0, "Threat not found");
        threats[threatId].status = Status.Verified;
        threats[threatId].lastUpdated = block.timestamp;
        threatHistory[threatId].push(StatusChange(Status.Verified, block.timestamp, msg.sender));
        emit ThreatVerified(threatId, msg.sender);
    }

    function updateThreatStatus(bytes32 threatId, Status newStatus) external onlyVerifier {
        require(threats[threatId].timestamp != 0, "Threat not found");
        threats[threatId].status = newStatus;
        threats[threatId].lastUpdated = block.timestamp;
        threatHistory[threatId].push(StatusChange(newStatus, block.timestamp, msg.sender));
        emit ThreatStatusUpdated(threatId, newStatus, msg.sender);
    }

    function revokeThreat(bytes32 threatId) external onlyVerifier {
        require(threats[threatId].timestamp != 0, "Threat not found");
        threats[threatId].status = Status.Revoked;
        threats[threatId].lastUpdated = block.timestamp;
        threatHistory[threatId].push(StatusChange(Status.Revoked, block.timestamp, msg.sender));
        emit ThreatRevoked(threatId, msg.sender);
    }

    function getThreat(bytes32 threatId) external view returns (Threat memory) {
        return threats[threatId];
    }

    function getThreatHistory(bytes32 threatId) external view returns (StatusChange[] memory) {
        return threatHistory[threatId];
    }
}
