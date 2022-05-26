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
let owner4;
let player;
let wallet;
let manager;


before(async function () {
  [owner,owner1, owner2,owner3,owner4 ,player, wallet,manager] = await ethers.getSigners();
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



it("minting and approving", async function () {
  const nftId = 1
  await bmc.connect(player).mint(player.address,BigInt(100000000000000000000000000000000000000000000)); //  minting the bmc contract
  await nft.connect(player).awardItem(player.address); 
  await nft.connect(player).awardItem(player.address);
  await nft.connect(player).awardItem(player.address);          // 
  await nft.connect(player).awardItem(player.address); 
  await nft.connect(player).awardItem(player.address); 
  await bmc.connect(player).approve(Mpl.address,BigInt(100000000000000000000000000000000000000000000));
  await nft.connect(player).approve(Mpl.address,1);
 
 
  
  const balance =await bmc.balanceOf(Mpl.address);
  expect(await bmc.balanceOf(player.address)).to.equals(BigInt(100000000000000000000000000000000000000000000));
  const tokenOwner = await nft.ownerOf(1);
  expect(tokenOwner).to.eql(player.address);

});

it("manager cant hire scholar if once hired for same nft ", async function () {
  await Mpl.connect(player).hireScholar(owner.address, 1,10,36000);
  await expect(Mpl.connect(player).hireScholar(owner.address, 1,1,36000)).to.be.reverted;
    
});

it("nft and bmn token transfer to the contract ", async function () {
  const tokenOwner = await nft.ownerOf(1);
  expect(tokenOwner).to.eql(Mpl.address);
  expect(await bmc.balanceOf(Mpl.address)).to.equals(BigInt(50000000000000000000));
    
});



    

it("cancels the offer , nft and token transfer back to the manager ", async function () {

  const tokenOwn = await Mpl.connect(owner).cancelOffer(1);
  const tokenOwner = await nft.ownerOf(1);
  expect(tokenOwner).to.equal(player.address);  
});
    

it("scholar is unable to respond the offer ", async function () {
  
  await expect(Mpl.connect(owner).respondOffer(1,1)).to.be.revertedWith().toString;
  
});


it("hire scholars", async function () {

  await nft.connect(player).approve(Mpl.address,2);
  await nft.connect(player).approve(Mpl.address,3);
  await nft.connect(player).approve(Mpl.address,4);
  await nft.connect(player).approve(Mpl.address,5);
  await Mpl.connect(player).hireScholar(owner1.address, 2,1,36000);
  await Mpl.connect(player).hireScholar(owner2.address, 3,1,36000);
  await Mpl.connect(player).hireScholar(owner3.address, 4,1,36000);
  await Mpl.connect(player).hireScholar(owner4.address, 5,1,36000);
   
  const tokenOwner = await nft.ownerOf(2);
  expect(tokenOwner).to.equal(Mpl.address);

});


it("NFT manager cant cancelled ", async function () {
  
  await expect(Mpl.connect(player).cancelOffer(1)).to.be.reverted;
  
});

it(" Respond offer and accept the offer,offer accept then mananger cant cancelled", async function () {
 await  Mpl.connect(owner1).respondOffer(2,1);
 await  Mpl.connect(owner2).respondOffer(3,1);
 await  Mpl.connect(owner3).respondOffer(4,1);
 await expect(Mpl.connect(player).settleNFT(2)).to.be.reverted;
});

it(" scholar is allowed if he accept the offer ", async function () {
 const check = await  Mpl.connect(player).isScholarAllowed(owner1.address,2)
 console.log(check);
   expect(check).to.be.true;
  
});



it("create Match", async function () {
  
 await Mpl.connect(manager).createMatch();
 const matchno =await Mpl.matchCount()
 await expect(matchno).to.be.equal(2);



});

it("start match ", async function () { 
  await Mpl.connect(owner1).startMatch(2,1);
  await Mpl.connect(owner2).startMatch(3,1);
  await Mpl.connect(owner3).startMatch(4,1);

 });

it("scholar cant join match again", async function () {

  await expect(Mpl.connect(owner3).startMatch(4,1)).to.be.revertedWith.toString();
   
});

it("set funding wallet ", async function () {

  await Mpl.connect(manager).setfundingWallet(wallet.address);
 
   
});

it("update Match, match ended", async function () {

  await Mpl.connect(manager).updateMatch([],[2,3,4],1);
  const matchended =  await Mpl.matchData(1);   
  console.log(matchended[4])
  expect(matchended[4]).to.be.true;
});

it("match can not update twice for same match ", async function () {


  expect(Mpl.connect(manager).updateMatch([],[2,3,4],1)).to.be.reverted;
   
});

it("reward is updated  ", async function () {

  const reward =  await Mpl.rewards(owner1.address); 
  console.log(reward[0]);
  expect(reward[0]).to.be.equal(BigInt(675000000000000000));
   
});


it("funding wallet balance increas ", async function () {

   const balance = await bmc.balanceOf(wallet.address);
   expect(balance).to.be.equal(BigInt(1500000000000000000));
   
});
 

it("won count is increas", async function () {

 const won =await Mpl.nftManager(2);
 expect(won[4]).to.be.equal(1);
  
});



it("only can get reward one time in 7 DAYS ", async function () {

  await Mpl.connect(owner1).getReward();

  await  expect(Mpl.connect(owner1).getReward()).to.be.revertedWith;
});




  
});
