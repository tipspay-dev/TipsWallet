// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialNameServer {
    mapping(string => address) public registry;
    function register(string memory _name) public {
        registry[_name] = msg.sender;
    }
}
