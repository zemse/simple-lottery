/*
  Author: Soham Zemse (https://github.com/zemse)
  In this file you should write tests for your smart contract as you progress in developing your smart contract. For reference of Mocha testing framework, you can check out https://devdocs.io/mocha/.
*/

/// @dev importing packages required
const assert = require('assert');
const ethers = require('ethers');
const ganache = require('ganache-cli');

/// @dev initialising development blockchain
const provider = new ethers.providers.Web3Provider(ganache.provider({ gasLimit: 8000000 }));

/// @dev importing build file
const lotteryJSON = require('../build/Lottery_Lottery.json');

/// @dev initialize global variables
let accounts, lotteryInstance;

/// @dev this is a test case collection
describe('Ganache Setup', async() => {

  /// @dev this is a test case. You first fetch the present state, and compare it with an expectation. If it satisfies the expectation, then test case passes else an error is thrown.
  it('initiates ganache and generates a bunch of demo accounts', async() => {

    /// @dev for example in this test case we are fetching accounts array.
    accounts = await provider.listAccounts();

    /// @dev then we have our expection that accounts array should be at least having 1 accounts
    assert.ok(accounts.length >= 1, 'atleast 2 accounts should be present in the array');
  });
});

/// @dev this is another test case collection
describe('Lottery Contract', () => {

  /// @dev describe under another describe is a sub test case collection
  describe('Lottery Setup', async() => {

    /// @dev this is first test case of this collection
    it('deploys Lottery contract from first account', async() => {

      /// @dev you create a contract factory for deploying contract. Refer to ethers.js documentation at https://docs.ethers.io/ethers.js/html/
      const LotteryContractFactory = new ethers.ContractFactory(
        lotteryJSON.abi,
        lotteryJSON.evm.bytecode.object,
        provider.getSigner(accounts[0])
      );
      lotteryInstance =  await LotteryContractFactory.deploy();

      assert.ok(lotteryInstance.address, 'conract address should be present');
    });
  });

  describe('Lottery Functionality', async() => {

    /// @dev this is first test case of this collection
    it('should be able to enter into lottery', async() => {

      const oldBalance = await provider.getBalance(accounts[0]);
      console.log({oldBalance});

      /// @dev you sign and submit a transaction to local blockchain (ganache) initialized on line 10.
      const tx = await lotteryInstance.functions.enterLottery('Shahrukh', {
        value: ethers.utils.parseEther('0.001')
      });

      // console.log(tx);

      /// @dev you can wait for transaction to confirm
      const receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed;

      const ethCharged = gasUsed.mul(tx.gasPrice);

      const newBalance = await provider.getBalance(accounts[0]);
      console.log({newBalance});

      assert.ok(oldBalance.sub(newBalance).eq(ethCharged.add(ethers.utils.parseEther('0.001'))), 'balance should be subtracted correctly');


      const firstEntry = await lotteryInstance.functions.entries(0);
      console.log({firstEntry});

      console.log(firstEntry.userAddress, accounts[0]);

      assert.equal(firstEntry.userAddress, accounts[0], 'address of lottery entry should be properly saved');
      assert.equal(firstEntry.name, 'Shahrukh', 'name should be properly set');
      assert.ok(firstEntry.amount.eq(ethers.utils.parseEther('0.001')), 'amount should be set properly');
    });
  });
});
