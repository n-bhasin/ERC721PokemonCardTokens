// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.7.0;
// pragma experimental ABIEncoderV2;
import "./ERC721Contract.sol";


contract Pokemon is ERC721Contract {
    address admin;
    uint256 pokemonId;

    struct PokemonCard {
        uint256 id;
        string name;
        uint256 attack;
        uint256 health;
    }
    uint256[] Id;
    mapping(uint256 => PokemonCard) public pokemon;
    mapping(uint256 => address) public idToOwner;

    // mapping(uint256 => Id[]) public idToCard;

    constructor() public {
        admin = msg.sender;
        //giving token 0 to owner;
        PokemonCard memory poke = PokemonCard(pokemonId, "Bulbasaur", 100, 100);
        pokemon[pokemonId] = poke;
        Id.push(pokemonId);
        mint(admin, pokemonId);
        idToOwner[pokemonId] = admin;
        pokemonId++;
    }

    function createPokemon(
        string calldata _name,
        uint256 _attack,
        uint256 _health
    ) external {
        require(_attack < 100, "Pokemon: The attack power should be <100.");
        require(_health > 0, "Pokemon: The health should be >0.");
        pokemon[pokemonId] = PokemonCard(pokemonId, _name, _attack, _health);
        Id.push(pokemonId);
        mint(msg.sender, pokemonId);
        idToOwner[pokemonId] = msg.sender;
        pokemonId++;
    }

    function sendPokemon(uint256 _tokenId, address _to) external {
        //check user is sending his own token
        address oldOwner = idToOwner[_tokenId];
        require(msg.sender == oldOwner, "Pokemon: Not Authorized to send.");
        _safeTransfer(oldOwner, _to, _tokenId, "");
        idToOwner[_tokenId] = _to;
    }

    function getCardsId() public view returns (uint256[] memory) {
        return Id;
    }

    function getSingleCard(uint256 _pokemonId)
        public
        view
        returns (
            string memory,
            uint256,
            uint256
        )
    {
        return (
            pokemon[_pokemonId].name,
            pokemon[_pokemonId].attack,
            pokemon[_pokemonId].health
        );
    }

    // function getCardDetails()
    //     public
    //     view
    //     returns (
    //         string memory,
    //         uint256,
    //         uint256
    //     )
    // {
    //     uint256[] memory id = getCardsId();
    //     uint256[] memory info;
    //     for (uint256 i = 0; i < id.length; i++) {
    //         info[getSingleCard(id[i])];
    //     }
    // }
}
