# ERC721PokemonCardTokens

# Personal Information

    Name: Neeraj Bhasin
    StudentID: 101263021

# Pokemon Card Game

I implemented ERC721 token to create Pokemon Cards.

Where Players have the privelege to create their own countless pokemon cards with their desired name , attack,and health. They can send their cards to their friends or to any other player.

With every new creation of card a ERC721 token is minted and a token is linked with that card. This means every card is uinque in itself.

I used safeTransferFron() function so that player can send their cards to another player and with this that card will have new owner.

Player can also fetch their own cards by using their pokemonId/tokeId by calling getSingleCard function.

Pokemon.sol is the file which is having all Game login.

# ERC721

I implemented all the mandatory function which are needed to create ERC721 token by .

ERC721Contract.sol is the contract file which implements all required to interfaces: ERC721, IERC721TokenReceiver, and i used Address library to fetch the contract address.

# Test Cases

All the possible test cases of both the contracts are in erc721contract.js file under test directory.
