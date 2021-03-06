pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/// @title Auth - manages users
/// @author Dino Radulovic
contract Auth is Ownable, Pausable {
    address public owner;

    /// @notice admins
    mapping (address => bool) public admins;
    /// @notice store owners
    mapping (address => bool) public storeOwners;

    /// @notice events
    event AdminAdded(address indexed addr);
    event AdminRemoved(address indexed addr);
    event StoreOwnerAdded(address indexed addr);
    event StoreOwnerRemoved(address indexed addr);

    constructor()
        public
    {
        owner = msg.sender;
        addAdmin(msg.sender);
    }

    /// @notice adds an admin
    function addAdmin(address _address)
    whenNotPaused
    onlyOwner
    public
    {
        require(admins[_address] != true);
        admins[_address] = true;
        emit AdminAdded(_address);
    }

    /// @notice removes the admin
    function removeAdmin(address _address)
    whenNotPaused
    onlyOwner
    public
    {
        delete admins[_address];
        emit AdminRemoved(_address);
    }

    /// @notice adds
    function addStoreOwner(address _address)
    whenNotPaused
    public
    {
        require(storeOwners[_address] != true);
        storeOwners[_address] = true;
        emit StoreOwnerAdded(_address);
    }

    /// @notice removes the store owner
    function removeStoreOwner(address _address)
    whenNotPaused
    public
    {
        delete storeOwners[_address];
        emit StoreOwnerRemoved(_address);
    }
}