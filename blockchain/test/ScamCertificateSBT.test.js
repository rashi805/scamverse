const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ScamCertificateSBT', function () {
  let sbt, admin, user1, user2, other;

  const SAMPLE_HASH = ethers.keccak256(ethers.toUtf8Bytes('test-certificate-payload'));
  const SAMPLE_URI  = 'https://example.com/cert/1.json';

  beforeEach(async function () {
    [admin, user1, user2, other] = await ethers.getSigners();
    const SBT = await ethers.getContractFactory('ScamCertificateSBT');
    sbt = await SBT.deploy();
    await sbt.waitForDeployment();
  });

  // ─── Deployment ───────────────────────────────────────────────────────────
  it('sets the deployer as admin', async function () {
    expect(await sbt.admin()).to.equal(admin.address);
  });

  it('has the correct name and symbol', async function () {
    expect(await sbt.name()).to.equal('SCAMVERSE 360 Certificate');
    expect(await sbt.symbol()).to.equal('SV360CERT');
  });

  it('starts with zero total supply', async function () {
    expect(await sbt.totalSupply()).to.equal(0n);
  });

  // ─── ERC-165 ─────────────────────────────────────────────────────────────
  it('supports ERC-165, ERC-721, ERC-721Metadata, ERC-5192 interfaces', async function () {
    expect(await sbt.supportsInterface('0x01ffc9a7')).to.equal(true);  // ERC-165
    expect(await sbt.supportsInterface('0x80ac58cd')).to.equal(true);  // ERC-721
    expect(await sbt.supportsInterface('0x5b5e139f')).to.equal(true);  // ERC-721Metadata
    expect(await sbt.supportsInterface('0xb45a3c0e')).to.equal(true);  // ERC-5192
    expect(await sbt.supportsInterface('0xdeadbeef')).to.equal(false); // random
  });

  // ─── Minting ─────────────────────────────────────────────────────────────
  it('allows admin to mint a certificate and emits Transfer, Locked, CertificateMinted', async function () {
    const tx = sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    await expect(tx)
      .to.emit(sbt, 'Transfer').withArgs(ethers.ZeroAddress, user1.address, 1n)
      .and.to.emit(sbt, 'Locked').withArgs(1n)
      .and.to.emit(sbt, 'CertificateMinted').withArgs(1n, user1.address, SAMPLE_HASH, SAMPLE_URI);
  });

  it('increments totalSupply and balanceOf after minting', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    expect(await sbt.totalSupply()).to.equal(2n);
    expect(await sbt.balanceOf(user1.address)).to.equal(2n);
  });

  it('rejects minting by non-admin', async function () {
    await expect(
      sbt.connect(other).mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH)
    ).to.be.revertedWith('SBT: only admin');
  });

  it('rejects minting to the zero address', async function () {
    await expect(
      sbt.mintCertificate(ethers.ZeroAddress, SAMPLE_URI, SAMPLE_HASH)
    ).to.be.revertedWith('SBT: mint to zero address');
  });

  // ─── getCertificate / ownerOf / tokenURI ─────────────────────────────────
  it('getCertificate returns correct stored data', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    const [recipient, certHash, uri, ts] = await sbt.getCertificate(1n);
    expect(recipient).to.equal(user1.address);
    expect(certHash).to.equal(SAMPLE_HASH);
    expect(uri).to.equal(SAMPLE_URI);
    expect(ts).to.be.gt(0n);
  });

  it('ownerOf returns the recipient address', async function () {
    await sbt.mintCertificate(user2.address, SAMPLE_URI, SAMPLE_HASH);
    expect(await sbt.ownerOf(1n)).to.equal(user2.address);
  });

  it('tokenURI returns the metadataURI', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    expect(await sbt.tokenURI(1n)).to.equal(SAMPLE_URI);
  });

  it('reverts ownerOf / getCertificate for nonexistent token', async function () {
    await expect(sbt.ownerOf(99n)).to.be.revertedWith('SBT: token does not exist');
    await expect(sbt.getCertificate(99n)).to.be.revertedWith('SBT: token does not exist');
  });

  // ─── ERC-5192 locked() ───────────────────────────────────────────────────
  it('locked() returns true for all minted tokens', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    expect(await sbt.locked(1n)).to.equal(true);
  });

  it('locked() reverts for nonexistent token', async function () {
    await expect(sbt.locked(42n)).to.be.revertedWith('SBT: token does not exist');
  });

  // ─── Soulbound: all transfers/approvals revert ───────────────────────────
  it('transferFrom reverts (soulbound)', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    await expect(
      sbt.connect(user1)['transferFrom(address,address,uint256)'](user1.address, user2.address, 1n)
    ).to.be.revertedWith('SBT: non-transferable');
  });

  it('safeTransferFrom (3-arg) reverts (soulbound)', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    await expect(
      sbt.connect(user1)['safeTransferFrom(address,address,uint256)'](user1.address, user2.address, 1n)
    ).to.be.revertedWith('SBT: non-transferable');
  });

  it('approve reverts (soulbound)', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    await expect(
      sbt.connect(user1).approve(user2.address, 1n)
    ).to.be.revertedWith('SBT: non-transferable');
  });

  it('setApprovalForAll reverts (soulbound)', async function () {
    await expect(
      sbt.connect(user1).setApprovalForAll(user2.address, true)
    ).to.be.revertedWith('SBT: non-transferable');
  });

  it('getApproved always returns zero address', async function () {
    await sbt.mintCertificate(user1.address, SAMPLE_URI, SAMPLE_HASH);
    expect(await sbt.getApproved(1n)).to.equal(ethers.ZeroAddress);
  });

  it('isApprovedForAll always returns false', async function () {
    expect(await sbt.isApprovedForAll(user1.address, user2.address)).to.equal(false);
  });

  // ─── Admin transfer ───────────────────────────────────────────────────────
  it('allows admin to transfer admin role', async function () {
    await sbt.transferAdmin(user1.address);
    expect(await sbt.admin()).to.equal(user1.address);
    // now old admin cannot mint
    await expect(
      sbt.mintCertificate(user2.address, SAMPLE_URI, SAMPLE_HASH)
    ).to.be.revertedWith('SBT: only admin');
  });
});
