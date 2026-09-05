const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ScamThreatRegistry', function () {
  let registry, admin, verifier, reporter, other;

  beforeEach(async function () {
    [admin, verifier, reporter, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory('ScamThreatRegistry');
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it('sets the deployer as admin', async function () {
    expect(await registry.admin()).to.equal(admin.address);
  });

  it('allows admin to add and remove verifiers', async function () {
    await registry.addVerifier(verifier.address);
    expect(await registry.roles(verifier.address)).to.equal(2); // Role.Verifier
    await registry.removeVerifier(verifier.address);
    expect(await registry.roles(verifier.address)).to.equal(0); // Role.None
  });

  it('rejects non-admin adding a verifier', async function () {
    await expect(registry.connect(other).addVerifier(verifier.address)).to.be.revertedWith('Only admin');
  });

  it('registers a threat as pending', async function () {
    const threatId = ethers.keccak256(ethers.toUtf8Bytes('threat-1'));
    const threatHash = ethers.keccak256(ethers.toUtf8Bytes('normalized-value'));

    await expect(registry.connect(reporter).registerThreat(threatId, threatHash, 'phishing_url'))
      .to.emit(registry, 'ThreatRegistered')
      .withArgs(threatId, threatHash, reporter.address);

    const threat = await registry.getThreat(threatId);
    expect(threat.status).to.equal(0); // Status.Pending
    expect(threat.reporter).to.equal(reporter.address);
  });

  it('prevents duplicate threat registration', async function () {
    const threatId = ethers.keccak256(ethers.toUtf8Bytes('threat-dup'));
    const threatHash = ethers.keccak256(ethers.toUtf8Bytes('value'));
    await registry.connect(reporter).registerThreat(threatId, threatHash, 'phishing_url');
    await expect(
      registry.connect(reporter).registerThreat(threatId, threatHash, 'phishing_url')
    ).to.be.revertedWith('Threat already exists');
  });

  it('only allows an authorized verifier to verify a threat', async function () {
    const threatId = ethers.keccak256(ethers.toUtf8Bytes('threat-verify'));
    const threatHash = ethers.keccak256(ethers.toUtf8Bytes('value'));
    await registry.connect(reporter).registerThreat(threatId, threatHash, 'phishing_url');

    await expect(registry.connect(other).verifyThreat(threatId)).to.be.revertedWith('Only verifier');

    await registry.addVerifier(verifier.address);
    await expect(registry.connect(verifier).verifyThreat(threatId))
      .to.emit(registry, 'ThreatVerified')
      .withArgs(threatId, verifier.address);

    const threat = await registry.getThreat(threatId);
    expect(threat.status).to.equal(2); // Status.Verified
  });

  it('tracks full status history', async function () {
    const threatId = ethers.keccak256(ethers.toUtf8Bytes('threat-history'));
    const threatHash = ethers.keccak256(ethers.toUtf8Bytes('value'));
    await registry.connect(reporter).registerThreat(threatId, threatHash, 'phishing_url');
    await registry.addVerifier(verifier.address);
    await registry.connect(verifier).verifyThreat(threatId);
    await registry.connect(verifier).revokeThreat(threatId);

    const history = await registry.getThreatHistory(threatId);
    expect(history.length).to.equal(3); // Pending -> Verified -> Revoked
    expect(history[2].status).to.equal(4); // Status.Revoked
  });
});
