const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');
const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
      .deploy({ data: '0x' + evm.bytecode.object })
      .send({ from: accounts[0], gas: '1000000' });
});


describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async() => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
    const players = await lottery.methods.getPlayers().call();
    assert.equal(1, players.length);
    assert.equal(accounts[0], players[0]);
  });

  it('allows multiple account to enter', async() => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });

    const players = await lottery.methods.getPlayers().call();
    assert.equal(3, players.length);

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
  });

  it('requires a minimum amount of ether to enter', async() => {
    try{
      await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.001', 'ether') });
      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('only manager can call pickWinner', async() => {
    try{
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('sends money to the winner and resets players array', async() => {
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('2', 'ether') });

    const balanceBefore = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const balanceAfter = await web3.eth.getBalance(accounts[1]);
    const difference = balanceAfter - balanceBefore;

    assert.equal(web3.utils.toWei('2', 'ether'), difference);
  });
});
