import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployContractsFixture(){
    const [account0, account1, account2] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("ERC20", account0);
    const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
    await erc20.deployed()
    return { erc20, account0, account1, account2}
}

async function deployMintContractsFixture(){
    const [account0, account1, account2] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("ERC20", account0);
    const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
    await erc20.deployed()

    const balance1: bigint = 10n * (10n ** 18n);
    const tx = await erc20.mint(account1.address, balance1);
    await tx.wait();

    return { erc20, account0, account1, account2, balance1}
}

describe("ERC20 contract states", function() {
    it("getters", async function() {
        const { erc20 } = await loadFixture(deployContractsFixture)

        expect(await erc20.name()).to.equal("Zenny");
        expect(await erc20.symbol()).to.equal("ZNY");
        expect(await erc20.decimals()).to.equal(18);
        expect(await erc20.totalSupply()).to.equal(0);
    });

});

describe("ERC20 mint", function(){
    it("mint", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);
    
        expect(await erc20.balanceOf(account0.address)).to.equal(0);
        expect(await erc20.balanceOf(account1.address)).to.equal(0);
        expect(await erc20.balanceOf(account2.address)).to.equal(0);
    
        const decimals: number = await erc20.decimals();

        const amount1: bigint = 10n * (10n ** BigInt(decimals));
        const tx1 = await erc20.mint(account1.address, amount1);
        const receipt1 = await tx1.wait();

        expect(await erc20.balanceOf(account0.address)).to.equal(0);
        expect(await erc20.balanceOf(account1.address)).to.equal(amount1);
        expect(await erc20.balanceOf(account2.address)).to.equal(0);
        expect(await erc20.totalSupply()).to.equal(amount1);

        const amount2: bigint = 20n * (10n ** BigInt(decimals));
        const tx2 = await erc20.mint(account1.address, amount2);
        const receipt2 = await tx2.wait();

        expect(await erc20.balanceOf(account0.address)).to.equal(0);
        expect(await erc20.balanceOf(account1.address)).to.equal(amount1 + amount2);
        expect(await erc20.balanceOf(account2.address)).to.equal(0);
        expect(await erc20.totalSupply()).to.equal(amount1 + amount2);
    })

    it("mint from non-owner", async function(){
       const {erc20, account0, account1, account2} = await loadFixture(deployContractsFixture);
       const amount = 123;

       await expect(erc20.connect(account1).mint(account1.address, amount)).to.be.revertedWith("only contract owner can call mint")
       expect(await erc20.balanceOf(account1.address)).to.equal(0);
    })

    it("mint overflow", async function (){
        const {erc20, account0, account1, account2} = await loadFixture(deployContractsFixture);
        const uint256Max: bigint = 2n ** 256n -1n;
    
        await erc20.mint(account1.address, uint256Max);
        await expect(erc20.mint(account1.address, 1)).to.be.revertedWithPanic(0x11);
    });

});

describe("ERC20 burn", function () {
    it("burn", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);

        // account1に 10 Zenny をmintする
        const decimals: number = await erc20.decimals();
        const amount1: bigint = 10n * (10n ** BigInt(decimals));
        const tx1 = await erc20.mint(account1.address, amount1);
        const receipt1 = await tx1.wait();

        // account1から 7 Zenny をburnする
        const amount2: bigint = 7n * (10n ** BigInt(decimals));
        const tx2 = await erc20.burn(account1.address, amount2);
        const receipt2 = await tx2.wait();        

        // mint と burn 後の残高確認
        expect(await erc20.balanceOf(account1.address)).to.equal(amount1 - amount2);
        expect(await erc20.totalSupply()).to.equal(amount1 - amount2);
    });

    it("burn from non-owner", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);
        const amount = 123;

        await expect(erc20.connect(account1).burn(account1.address, amount)).to.be.revertedWith('only contract owner can call burn');
    });

    it("burn from zero address", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);
        const amount = 123;

        await expect(erc20.burn(ethers.constants.AddressZero, amount)).to.be.revertedWith('burn from the zero address is not allowed');
    });    


    it("minus overflow", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);

        // 残高を1に増やす
        await erc20.mint(account1.address, 1);
        // そこから残高を -2 しようとすると負の残高になって revert する
        await expect(erc20.burn(account1.address, 2)).to.be.revertedWithPanic(0x11);
    });    
});

describe("ERC20 transfer", function(){
    it("transfer and Transfer event", async function(){
        const { erc20, account0, account1, account2, balance1 }= await loadFixture(deployMintContractsFixture);
        const decimals: number = await erc20.decimals();
        const amount: bigint = 7n * (10n ** BigInt(decimals));
        await expect(erc20.connect(account1).transfer(account2.address, amount))
        .to.emit(erc20, "Transfer").withArgs(account1.address, account2.address, amount);
        
        expect(await erc20.balanceOf(account1.address)).to.equal(balance1 - amount);
        expect(await erc20.balanceOf(account2.address)).to.equal(amount);

    });

        it("transfer too much amount", async function () {
        const { erc20, account0, account1, account2 , balance1 } = await loadFixture(deployMintContractsFixture);

        // account1 から残高以上の金額を account2 に送ることはできない
        await expect(erc20.connect(account1).transfer(account2.address, balance1 + 1n)).to.be.revertedWith('transfer amount cannot exceed balance');
    });    

    it("transfer to zero address", async function () {
        const { erc20, account0, account1, account2 , balance1 } = await loadFixture(deployMintContractsFixture);

        await expect(erc20.connect(account1).transfer(ethers.constants.AddressZero, 1)).to.be.revertedWith('transfer to the zero address is not allowed');
    });    

    it("Transfer event from mint", async function () {
        const { erc20, account0, account1, account2 } = await loadFixture(deployContractsFixture);
        const amount = 123;
        await expect(erc20.mint(account1.address, amount))
            .to.emit(erc20, "Transfer")
            .withArgs(ethers.constants.AddressZero, account1.address, amount);
    });

    it("Transfer event from burn", async function () {
        const { erc20, account0, account1, account2 , balance1 } = await loadFixture(deployMintContractsFixture);
        const amount = 123;
        await expect(erc20.burn(account1.address, amount))
            .to.emit(erc20, "Transfer")
            .withArgs(account1.address, ethers.constants.AddressZero, amount);
    });

});

describe("ERC20 approve and transferFrom", function () {
    it("allowance and approve", async function () {
        const { erc20, account0, account1, account2, balance1 } = await loadFixture(deployMintContractsFixture);

        // 初期状態では allowance はゼロ
        expect(await erc20.allowance(account1.address, account2.address)).to.equal(0);
        
        const amount = 123;
        expect(await erc20.connect(account1).approve(account2.address, amount))
            .to.emit(erc20, "Approval")
            .withArgs(account1.address, account2.address, amount);

        // approve 後の allowance の値が正しいことを確認
        expect(await erc20.allowance(account1.address, account2.address)).to.equal(amount);            
    });
        
    it("transferFrom", async function () {
        const { erc20, account0, account1, account2, balance1 } = await loadFixture(deployMintContractsFixture);
        
        // allowanceを初期残高の3倍に設定してみる
        const allowance = 3n * balance1;
        await erc20.connect(account1).approve(account2.address, allowance);
        
        // account2 の命令により、トークンを account1 から account0 に移動する
        expect(await erc20.connect(account2).transferFrom(account1.address, account0.address, balance1))
            .to.emit(erc20, "Approval")
            .withArgs(account1.address, account2.address, allowance - balance1)
            .to.emit(erc20, "Transfer")
            .withArgs(account1.address, account0.address, balance1);

        // transferFrom の後の allowance と balance
        expect(await erc20.allowance(account1.address, account2.address)).to.equal(allowance - balance1);            
        expect(await erc20.balanceOf(account0.address)).to.equal(balance1);   
        expect(await erc20.balanceOf(account1.address)).to.equal(0);            
        expect(await erc20.balanceOf(account2.address)).to.equal(0);            
    }); 

    it("transferFrom insufficient allowance", async function () {
        const { erc20, account0, account1, account2, balance1 } = await loadFixture(deployMintContractsFixture);

        // allowance の値を非常に小さく設定
        await erc20.connect(account1).approve(account2.address, 1);
                
        // account1には十分な残高があるが、allowanceが不足している
        await expect(erc20.connect(account2).transferFrom(account1.address, account0.address, balance1))
            .to.be.revertedWith('insufficient allowance');
    });  
    
});