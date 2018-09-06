pragma solidity 0.4.24;

import './Auth.sol';

/// @title Marketplace - manages stores and products
/// @author Dino Radulovic
contract Marketplace is Pausable {
    address authContractAddress;
    uint public storeIdGenerator;

    struct Store {
        address owner;
        uint id;
        uint balance;
    }

    struct Product {
        uint id;
        uint storeId;
        bytes32 name;
        uint price;
    }

    /// @notice stores/storefronts
    mapping (uint => Store) public storeById;
    mapping (address => uint[]) public storeIdsByAccount;
    mapping (address => uint) public storesCountByAccount;

    /// @notice products
    mapping (uint => Product) public productById;
    mapping (uint => Product[]) public products;
    mapping (uint => uint) public productsCount;
    mapping (uint => string) public imagesProduct;

    /// @notice checks if store owner is making a call
    modifier isStoreOwner() {
        Auth auth = Auth(authContractAddress);
        require(auth.storeOwners(msg.sender));
        _;
    }

    /// @notice checks for store owners validity
    /// @dev is user authorized to do such operation
    modifier storeBelongsToUser(uint _storeId) {
        Store store = storeById[_storeId];
        require(msg.sender == store.owner);
        _;
    }

    /// @notice events
    event StoreAdded(address indexed addr, uint id);
    event ProductAdded(uint indexed storeId, uint id, bytes32 name, uint price);
    event ProductRemoved(uint indexed storeId, uint id, bytes32 name, uint price);
    event ProductPriceUpdated(uint productId, uint price);

    constructor(address _authContractAddress)
    public
    {
        authContractAddress = _authContractAddress;
    }

    /// @notice adds the store
    /// @dev increments track of stores count - tracked by senders account
    /// @dev store IDs are saved in the array
    /// @dev store IDs are used later to get the store
    function addStore()
    whenNotPaused
    isStoreOwner()
    external {
        storeIdGenerator++;
        storesCountByAccount[msg.sender]++;

        Store memory store = Store(msg.sender, storeIdGenerator, 0);
        storeIdsByAccount[msg.sender].push(storeIdGenerator);
        storeById[storeIdGenerator] = store;
        emit StoreAdded(msg.sender, storeIdGenerator);
    }

    /// @notice gets store owner's stores
    /// @param _address - store owners account
    /// @return tuple (store IDs, store balances)
    function getAllStoreOwnerStores(address _address)
    whenNotPaused
    external view
    returns (uint[], uint[]) {
        uint[] memory ids = new uint[](storesCountByAccount[_address]);
        uint[] memory storeBalances = new uint[](storesCountByAccount[_address]);

        for (uint i = 0; i < storesCountByAccount[_address]; i++) {
            uint storeId = storeIdsByAccount[_address][i];
            ids[i] = storeId;
            storeBalances[i] = storeById[storeId].balance;
        }

        return (ids, storeBalances);
    }

    /// @notice gets all stores
    /// @dev for convenience, store ID's are used as store names here
    /// @return ids - store ID's(as store names in the browser)
    function getAllStores()
    public view
    returns (uint[]) {
        uint storesLength = storeIdGenerator;
        uint[] memory ids = new uint[](storesLength);

        uint idCount = 0;
        for (uint i = 1; i <= storesLength; i++) {
            ids[idCount] = i;
            idCount++;
        }

        return ids;
    }

    /// @notice gets balance for particular store
    function getStoreBalance(uint _storeId)
    public view
    returns(uint) {
        Store storage store = storeById[_storeId];
        return store.balance;
    }


    /// @notice adds product to the store
    function addProductToStore(uint _storeId, bytes32 _name, uint _price, string _image)
    whenNotPaused
    isStoreOwner()
    storeBelongsToUser(_storeId)
    external {
        productsCount[_storeId]++;
        Product memory product = Product(productsCount[_storeId], _storeId, _name, _price);
        products[_storeId].push(product);
        productById[productsCount[_storeId]] = product;
        imagesProduct[productsCount[_storeId]] = _image;

        emit ProductAdded(_storeId, productsCount[_storeId], _name, _price);
    }

    /// @notice removes product from the store
    /// @dev some things are weird here, I definitely underestimated it
    function removeProductFromStore(uint _storeId, uint _index)
    whenNotPaused
    isStoreOwner()
    storeBelongsToUser(_storeId)
    public {
        uint productId = products[_storeId][_index].id;
        bytes32 productName = products[_storeId][_index].name;
        uint productPrice = products[_storeId][_index].price;

        emit ProductRemoved(_storeId, productId, productName, productPrice);

        for (uint i = _index; i < products[_storeId].length - 1; i++){
            products[_storeId][i] = products[_storeId][i + 1];
        }

        delete products[_storeId][_index];
        delete productById[productId];

        products[_storeId].length--;
        productsCount[_storeId]--;
    }

    /// @notice gets all the stores products
    function getProducts(uint _storeId)
    public view
    returns (uint[], bytes32[], uint[]) {
        uint[] memory productIds = new uint[](productsCount[_storeId]);
        bytes32[] memory productNames = new bytes32[](productsCount[_storeId]);
        uint[] memory productPrices = new uint[](productsCount[_storeId]);

        for (uint i = 0; i < productsCount[_storeId]; i++) {
            Product memory product = products[_storeId][i];
            productIds[i] = product.id;
            productNames[i] = product.name;
            productPrices[i] = product.price;
        }

        return (productIds, productNames, productPrices);
    }

    /// @notice updates the product price
    function updateProductPrice(uint _storeId, uint _productId, uint _newPrice)
    whenNotPaused
    isStoreOwner()
    storeBelongsToUser(_storeId)
    external {
        for (uint i = 0; i < productsCount[_storeId]; i++) {
            if (_productId == products[_storeId][i].id) {
                products[_storeId][i].price = _newPrice;
                productById[_productId].price = _newPrice;
                emit ProductPriceUpdated(_productId, _newPrice);
            }
        }
    }

    /// @notice buying a product
    /// @dev increases store's balance
    function buyProduct(uint _productId, uint _storeId)
    external
    payable
    {
        storeById[_storeId].balance += productById[_productId].price;
    }

    /// @notice withdraw from the store
    /// @dev transfers balance to the store owner
    function withdrawFromStore(uint _storeId, uint _amount)
    whenNotPaused
    isStoreOwner()
    storeBelongsToUser(_storeId)
    external {
        require(_amount <= address(this).balance);

        Store storage store = storeById[_storeId];
        address storeOwner = store.owner;

        store.balance -= _amount;
        storeOwner.transfer(_amount);
    }
}
