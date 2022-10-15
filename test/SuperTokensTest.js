const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SuperTokens", function () {
  this.timeout(50000);

  let superTokenContract;
  let owner;
  let acc1;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const SuperTokens = await ethers.getContractFactory("SuperTokens");
    [owner, acc1, acc2] = await ethers.getSigners();
    superTokenContract = await SuperTokens.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await superTokenContract.owner()).to.equal(owner.address);
  });

  it("Should mint one NFT", async function () {
    expect(await superTokenContract.balanceOf(acc1.address)).to.equal(0);

    const tokenURI = "https://example.com/1";
    const tokenId = 0;
    const tx = await superTokenContract.connect(owner).mintCharacter(tokenURI);
    await tx.wait();

    expect(await superTokenContract.balanceOf(acc1.address)).to.equal(0);
  });

  it("Should set the correct tokenURI", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";

    const tx1 = await superTokenContract
      .connect(owner)
      .mintCharacter(tokenURI_1);
    await tx1.wait();
    const tx2 = await superTokenContract
      .connect(owner)
      .mintCharacter(tokenURI_2);
    await tx2.wait();

    expect(await superTokenContract.tokenURI(0)).to.equal(tokenURI_1);
    expect(await superTokenContract.tokenURI(1)).to.equal(tokenURI_2);
  });
});
