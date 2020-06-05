const { expectRevert } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const ERC721Contract = artifacts.require("ERC721Contract");
const BadMockContract = artifacts.require("BadMockContract");
const Pokemon = artifacts.require("Pokemon");
const mintingAddress = "0x0000000000000000000000000000000000000000";
contract("ERC721 Contract", (accounts) => {
  let instance;
  const [admin, trader1, trader2] = [accounts[0], accounts[1], accounts[2]];
  before(async () => {
    instance = await ERC721Contract.deployed();
    for (let i = 0; i < 3; i++) {
      let tx = await instance.mint(admin, i);
    }
  });

  it("test: balanceOf function", async () => {
    const initialTokenSupply = 3;
    let tx = await instance.balanceOf.call(admin);
    assert(
      new BigNumber(tx).isEqualTo(new BigNumber(initialTokenSupply)),
      "This is not expected supply"
    );
  });

  it("test: ownerOf function", async () => {
    const tokenId = 0;
    const addresExpected = admin;
    const tx = await instance.ownerOf.call(tokenId);
    assert(tx === addresExpected, "This is not expected owner");
  });

  it("test: getApproved function", async () => {
    const tokenId = 0;
    //as no one has minted the tokens..so the addressb will be 0
    const addresExpected = "0x0000000000000000000000000000000000000000";
    let tx = await instance.getApproved.call(tokenId);
    assert(tx === addresExpected, "This is not expected approving token Id");
  });

  it("test: transferFrom() should transfer", async () => {
    const tokenId = 0;
    const adminBalanceBefore = await instance.balanceOf.call(admin);
    // const trader1BalanceBefore = await instance.balanceOf.call(trader1);

    const receipt = await instance.transferFrom(admin, trader1, tokenId, {
      from: admin,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(admin),
      instance.balanceOf(trader1),
      instance.ownerOf(tokenId),
    ]);

    assert(
      new BigNumber(adminBalanceBefore)
        .minus(new BigNumber(adminBalance))
        .isEqualTo(new BigNumber(trader1Balance)),
      "This is not expected supply"
    );
    assert(owner === trader1, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj._from === admin &&
        obj._to === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  //check the call to ERC721Receiver contract is made or not

  it("test: safetransferFrom() should transfer", async () => {
    const tokenId = 1;
    const adminBalanceBefore = await instance.balanceOf.call(admin);
    // const trader1BalanceBefore = await instance.balanceOf.call(trader1);
    // const receipt1 = await instance.approve(admin, tokenId, { from: admin });
    // console.log(receipt1);
    const receipt = await instance.transferFrom(admin, trader1, tokenId, {
      from: admin,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(admin),
      instance.balanceOf(trader1),
      instance.ownerOf(tokenId),
    ]);

    assert(adminBalance.toNumber() === 1, "This is not expected supply");
    assert(owner === trader1, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj._from === admin &&
        obj._to === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  //check what happends if contract is implementing ERC721Receiver
  it("safeTransferFrom should not transfer if receipent does not implement erc721receiver", async () => {
    const badRecipient = await BadMockContract.new();
    await expectRevert(
      instance.safeTransferFrom(trader1, badRecipient.address, 0, {
        from: trader1,
      }),
      "revert"
    );
  });
  it("should transfer when apporved", async () => {
    const tokenId = 2;
    const trader1BalanceBefore = await instance.balanceOf.call(trader1);
    const receipt1 = await instance.approve(trader1, tokenId, { from: admin });

    const apporvedReceipt = await instance.getApproved(tokenId);
    const receipt2 = await instance.transferFrom(trader1, trader2, tokenId, {
      from: trader1,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(trader1),
      instance.balanceOf(trader2),
      instance.ownerOf(tokenId),
    ]);

    assert(
      new BigNumber(trader1BalanceBefore)
        .minus(new BigNumber(adminBalance))
        .isEqualTo(new BigNumber(trader1Balance)),
      "This is not expected supply"
    );
    assert(owner === trader2, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt1, "Approval", (obj) => {
      return (
        obj._owner === admin &&
        obj._approved === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  it("test setApprovalForAll function", async () => {
    const receipt = await instance.setApprovalForAll(admin, true, {
      from: trader1,
    });

    truffleAssert.eventEmitted(receipt, "ApprovalForAll", (obj) => {
      return (
        obj._owner === trader1 &&
        obj._operator === admin &&
        obj._approved === true
      );
    });
    const receipt2 = await instance.isApprovedForAll.call(trader1, admin);

    assert(receipt2 === true, "This is not expected apporved output");
  });
});

contract("Pokemon", (accounts) => {
  let pokemonInstance;
  const [admin, player1, player2] = [accounts[0], accounts[1], accounts[2]];
  //first pokemon created by the admin
  const firstPokemonName = "Bulbasaur";
  const firstPokemonAttack = new BigNumber(100);
  const firstPokemonHealth = new BigNumber(100);

  before(async () => {
    pokemonInstance = await Pokemon.deployed();
  });

  it("Check pre-created Pokemon card 'Bulbasaur'", async () => {
    const tokenId = 0;
    const receipt = await pokemonInstance.pokemon(tokenId);

    assert(
      receipt.name === firstPokemonName,
      "This is not expected Pokemon Name"
    );

    assert(
      new BigNumber(receipt.attack).isEqualTo(firstPokemonAttack),
      "This is not expected Pokemon Attack"
    );
    assert(
      new BigNumber(receipt.health).isEqualTo(firstPokemonHealth),
      "This is not expected Pokemon Health"
    );
  });

  it("should return the right owner", async () => {
    const tokenId = 0;
    const receipt = await pokemonInstance.idToOwner(tokenId);
    assert(receipt === admin);
  });

  it("should create a desired pokemon", async () => {
    const name = "Charmendar";
    const attack = 99;
    const health = 88;
    const pokemonId = 1;
    const pokeReceipt = await pokemonInstance.createPokemon(
      name,
      attack,
      health,
      { from: player1 }
    );

    const mintedTx = await pokemonInstance.mint(player1, pokemonId);
    truffleAssert.eventEmitted(mintedTx, "Transfer", (obj) => {
      return (
        obj._from === mintingAddress &&
        obj._to === player1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(pokemonId))
      );
    });
    assert(
      pokeReceipt,
      name,
      attack,
      health,
      "This is not expected information"
    );
    const receipt = await pokemonInstance.idToOwner(pokemonId);

    assert(receipt === player1, "This is not expected owner");
  });

  it("Should the return array of ids", async () => {
    let receipt = await pokemonInstance.getCardsId.call();

    assert(
      new BigNumber(receipt[0]).isEqualTo(new BigNumber(0)),
      "This is not expected Id: 0"
    );
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(1)),
      "This is not expected Id: 1"
    );
  });

  it("get the singlecard using id", async () => {
    const tokendId = 1;
    let receipt = await pokemonInstance.getSingleCard.call(tokendId);

    assert(receipt[0] === "Charmendar", "This is not expected name");
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(99)),
      "This is not expected Pokemon Attack"
    );
    assert(
      new BigNumber(receipt[2]).isEqualTo(new BigNumber(88)),
      "This is not expected Pokemon Health"
    );
  });
});
