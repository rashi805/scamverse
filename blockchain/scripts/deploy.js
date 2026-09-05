const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('');

  // --- 1. ScamThreatRegistry ---
  const ScamThreatRegistry = await hre.ethers.getContractFactory('ScamThreatRegistry');
  const registry = await ScamThreatRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log('ScamThreatRegistry deployed to:', registryAddress);

  // --- 2. ScamCertificateSBT ---
  const ScamCertificateSBT = await hre.ethers.getContractFactory('ScamCertificateSBT');
  const sbt = await ScamCertificateSBT.deploy();
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log('ScamCertificateSBT  deployed to:', sbtAddress);

  console.log('');
  console.log('=== Add these to backend/.env ===');
  console.log(`THREAT_REGISTRY_CONTRACT_ADDRESS=${registryAddress}`);
  console.log(`SBT_CONTRACT_ADDRESS=${sbtAddress}`);
  console.log('=================================');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
