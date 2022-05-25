const { expect } = require("chai");
const { ethers } = require("hardhat");
var bigInt = require("big-integer");


describe ("ScholarMarketPlace" , function () {
let nft;
let nftContractAddress;
let bmc;
let Mpl;
let owner;
let owner1;
let owner2;
let owner3;
let player;
let wallet;
let manager;


before(async function () {
  [owner,owner1, owner2,owner3, player, wallet,manager] = await ethers.getSigners();
  // Get the ContractFactory and Signers here.
  const NFT = await ethers.getContractFactory("GameItem");
  nft = await NFT.deploy();
  await nft.deployed();
  
  const BMC = await ethers.getContractFactory("bmccontract");
  bmc = await BMC.connect(player).deploy();
  await bmc.deployed();
  
  const marketplace = await ethers.getContractFactory("ScholarMarket");
  Mpl= await marketplace.connect(manager).deploy(nft.address,bmc.address);
  await Mpl.deployed();
  
     
  nftContractAddress = nft.address;
});



it("approve nft and token", async function () {
  const nftId = 1
  await bmc.connect(player).mint(player.address,BigInt(100000000000000000000000)); //  minting the bmc contract
  await bmc.connect(player).mint(player.address,BigInt(100000000000000000000000));
  await nft.connect(player).awardItem(player.address); 
  await nft.connect(player).awardItem(player.address);
  await nft.connect(player).awardItem(player.address);          
  await nft.connect(player).awardItem(player.address); 
  await bmc.connect(player).approve(Mpl.address,BigInt(100000000000000000000000));
  await bmc.connect(player).approve(Mpl.address,BigInt(100000000000000000000000));
  await nft.connect(player).approve(Mpl.address,1);
 
  await Mpl.connect(player).hireScholar(owner.address, 1,10,36000);
  await expect(Mpl.connect(player).hireScholar(owner.address, 1,1,36000)).to.be.reverted;
  
  const balance =await bmc.balanceOf(Mpl.address);
  expect(await bmc.balanceOf(Mpl.address)).to.equals(BigInt(50000000000000000000));
  
  const tokenOwner = await nft.ownerOf(1);
  expect(tokenOwner).to.eql(Mpl.address);

});
    

it("cancels the offer ", async function () {

  const tokenOwn = await Mpl.connect(owner).cancelOffer(1);
  const tokenOwner = await nft.ownerOf(1);
  expect(tokenOwner).to.equal(player.address);
    
    
});
    

it("Offer is cancelled ", async function () {
  
  await expect(Mpl.connect(owner).respondOffer(1,1)).to.be.revertedWith().toString;
  
});


it("hire scholar", async function () {

  await nft.connect(player).approve(Mpl.address,2);
  await nft.connect(player).approve(Mpl.address,3);
  await nft.connect(player).approve(Mpl.address,4);
  await Mpl.connect(player).hireScholar(owner1.address, 2,1,36000);
  await Mpl.connect(player).hireScholar(owner2.address, 3,1,36000);
  await Mpl.connect(player).hireScholar(owner3.address, 4,1,36000);
   
  const tokenOwner = await nft.ownerOf(2);
  expect(tokenOwner).to.equal(Mpl.address);

});


it("NFT manager cant cancelled ", async function () {
  
  await expect(Mpl.connect(player).cancelOffer(1)).to.be.reverted;
  
});

    
it("Settle NFT ", async function () {
  
 await expect(Mpl.connect(player).settleNFT(1)).to.be.reverted;
  
});


it(" Respond offer", async function () {
 await  Mpl.connect(owner1).respondOffer(2,1);
 await  Mpl.connect(owner2).respondOffer(3,1);
 await  Mpl.connect(owner3).respondOffer(4,1);
});


it("create Match", async function () {
  
 const matchno =await Mpl.connect(manager).createMatch();
 await Mpl.connect(owner1).startMatch(2,1);
 await Mpl.connect(owner2).startMatch(3,1);
 await Mpl.connect(owner3).startMatch(4,1);

});

it("update wallet address", async function () {

  await Mpl.connect(manager).setfundingWallet(manager.address);
   
});


it("update Match", async function () {

  await Mpl.connect(manager).updateMatch([],[2,3,4],1);
   
});


it("Reward", async function () {

  await Mpl.connect(owner1).getReward();
   
});
 
 
it("set Fee ", async function () {

  await Mpl.connect(manager).setFee(1000);
   
});



it("setBMN", async function () {

  await Mpl.connect(manager).setBMN(bmc.address);
  
});



it("owner Withdraw BMN", async function () {

  await Mpl.connect(manager).ownerWithdrawBMN(bmc.address, 1000);
  
});


it("owner Withdraw NFT", async function () {

  await Mpl.connect(manager).ownerWithdrawNft(2);
    
});


it("setDistro", async function () {

  await Mpl.connect(manager).setDistro(10,1,[1,2,3]);
      
});

  
});
