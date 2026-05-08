// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SocialNameServer
 * @notice Manages user.tips name registrations for TipsWallet gasless transfers
 * @dev Names are registered as "username" and resolved as "username.tips"
 *      e.g. register("alice") -> alice.tips -> 0x1234...
 *      Used by TipsWallet (tipspay.org/wallet) for gasless transfers
 */
contract SocialNameServer {
    // name => owner address
    mapping(string => address) public registry;

    // address => name (reverse lookup)
    mapping(address => string) public reverseRegistry;

    // name => registration timestamp
    mapping(string => uint256) public registrationTime;

    // Registration fee (can be 0 for gasless)
    uint256 public registrationFee;

    // Contract owner
    address public owner;

    event NameRegistered(string indexed name, address indexed owner);
    event NameTransferred(string indexed name, address indexed from, address indexed to);
    event NameReleased(string indexed name, address indexed owner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        registrationFee = 0; // Gasless by default
    }

    /**
     * @notice Register a user.tips name
     * @param _name The name to register (without .tips suffix)
     * @dev Registers "alice" which resolves as "alice.tips"
     */
    function register(string memory _name) public payable {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 32, "Name too long");
        require(registry[_name] == address(0), "Name already registered");
        require(bytes(reverseRegistry[msg.sender]).length == 0, "Address already has a name");
        require(msg.value >= registrationFee, "Insufficient registration fee");

        registry[_name] = msg.sender;
        reverseRegistry[msg.sender] = _name;
        registrationTime[_name] = block.timestamp;

        emit NameRegistered(_name, msg.sender);
    }

    /**
     * @notice Resolve a user.tips name to an address
     * @param _name The name to resolve (without .tips suffix)
     * @return The address associated with the name
     */
    function resolve(string memory _name) public view returns (address) {
        return registry[_name];
    }

    /**
     * @notice Reverse resolve an address to its user.tips name
     * @param _addr The address to look up
     * @return The name associated with the address (without .tips suffix)
     */
    function reverseResolve(address _addr) public view returns (string memory) {
        return reverseRegistry[_addr];
    }

    /**
     * @notice Check if a name is available for registration
     * @param _name The name to check (without .tips suffix)
     * @return True if the name is available
     */
    function isAvailable(string memory _name) public view returns (bool) {
        return registry[_name] == address(0);
    }

    /**
     * @notice Transfer a user.tips name to another address
     * @param _name The name to transfer
     * @param _to The address to transfer the name to
     */
    function transfer(string memory _name, address _to) public {
        require(registry[_name] == msg.sender, "Not the name owner");
        require(_to != address(0), "Invalid address");
        require(bytes(reverseRegistry[_to]).length == 0, "Target address already has a name");

        delete reverseRegistry[msg.sender];
        registry[_name] = _to;
        reverseRegistry[_to] = _name;

        emit NameTransferred(_name, msg.sender, _to);
    }

    /**
     * @notice Release a user.tips name
     * @param _name The name to release
     */
    function release(string memory _name) public {
        require(registry[_name] == msg.sender, "Not the name owner");

        delete registry[_name];
        delete reverseRegistry[msg.sender];
        delete registrationTime[_name];

        emit NameReleased(_name, msg.sender);
    }

    /**
     * @notice Update the registration fee (owner only)
     * @param _fee New registration fee in wei
     */
    function setRegistrationFee(uint256 _fee) public onlyOwner {
        registrationFee = _fee;
    }

    /**
     * @notice Withdraw collected fees (owner only)
     */
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
