// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Libere1155Core is ERC1155Supply, ERC2981, Ownable, ReentrancyGuard {
    event ItemCreated(uint256 indexed id, uint256 price, address indexed recipient, address indexed creator, uint96 royaltyBps, string metadataUri);
    event ItemPurchased(address indexed buyer, uint256 indexed id, uint256 amount, address paymentToken);
    event ItemPurchasedForLibrary(address indexed buyer, address indexed pool, uint256 indexed id, uint256 amount, address paymentToken);
    event Withdrawal(address indexed recipient, uint256 amount, address paymentToken);
    event PaymentTokenSet(address indexed token);
    event PlatformFeeSet(address indexed recipient, uint96 feeBps);
    event URISet(uint256 indexed id, string newUri);

    struct Item {
        uint256 price;
        address payable recipient;
        uint256 balance;
        bool exists;
    }

    mapping(uint256 => Item) public items;
    mapping(uint256 => string) private tokenURIs;

    address public paymentToken;         // address(0)=ETH; else ERC20 (USDC)
    address public platformFeeRecipient; // optional
    uint96  public platformFeeBps;       // <= 10%
    uint256 private platformOwedETH;
    uint256 private platformOwedERC20;

    constructor(address admin) ERC1155("Libere1155Core") Ownable(admin) {}

    /* Admin */
    function setPaymentToken(address erc20) external onlyOwner { paymentToken = erc20; emit PaymentTokenSet(erc20); }
    function setPlatformFee(address recipient, uint96 feeBps) external onlyOwner {
        require(feeBps <= 1000, "fee too high");
        platformFeeRecipient = recipient;
        platformFeeBps = feeBps;
        emit PlatformFeeSet(recipient, feeBps);
    }

    /* Catalog */
    function createItem(
        uint256 id,
        uint256 price,
        address payable recipient,
        address royaltyRecipient,
        uint96 royaltyBps,
        string memory metadataUri
    ) external onlyOwner {
        require(!items[id].exists, "exists");
        require(recipient != address(0), "bad recipient");
        require(royaltyRecipient != address(0), "bad royalty recipient");
        require(royaltyBps <= 1000, "royalty too high");
        require(price > 0, "price=0");

        items[id] = Item({ price: price, recipient: recipient, balance: 0, exists: true });
        tokenURIs[id] = metadataUri;
        _setTokenRoyalty(id, royaltyRecipient, royaltyBps);

        emit ItemCreated(id, price, recipient, msg.sender, royaltyBps, metadataUri);
    }

    /* Sales */
    function _takePayment(uint256 total) internal {
        if (paymentToken == address(0)) {
            require(msg.value == total, "bad ETH");
        } else {
            require(msg.value == 0, "ETH not accepted");
            require(IERC20(paymentToken).transferFrom(msg.sender, address(this), total), "ERC20 transferFrom fail");
        }
    }
    function _splitToBalances(uint256 id, uint256 gross) internal {
        uint256 fee = (platformFeeRecipient != address(0) && platformFeeBps > 0) ? (gross * platformFeeBps) / 10_000 : 0;
        uint256 net = gross - fee;
        items[id].balance += net;
        if (paymentToken == address(0)) platformOwedETH += fee; else platformOwedERC20 += fee;
    }

    function purchaseItem(uint256 id, uint256 amount) external payable nonReentrant {
        Item storage it = items[id]; require(it.exists, "no item"); require(amount > 0, "amount=0");
        uint256 total = it.price * amount; _takePayment(total);
        _mint(msg.sender, id, amount, "");
        _splitToBalances(id, total);
        emit ItemPurchased(msg.sender, id, amount, paymentToken);
    }

    function purchaseItemForLibrary(address pool, uint256 id, uint256 amount) external payable nonReentrant {
        require(pool != address(0), "bad pool");
        Item storage it = items[id]; require(it.exists, "no item"); require(amount > 0, "amount=0");
        uint256 total = it.price * amount; _takePayment(total);
        _mint(pool, id, amount, "");
        _splitToBalances(id, total);
        emit ItemPurchasedForLibrary(msg.sender, pool, id, amount, paymentToken);
    }

    function withdrawFunds(uint256 id) external nonReentrant {
        Item storage it = items[id]; require(it.exists, "no item"); require(msg.sender == it.recipient, "not recipient");
        uint256 amount = it.balance; require(amount > 0, "no funds"); it.balance = 0;
        if (paymentToken == address(0)) {
            (bool ok, ) = it.recipient.call{value: amount}(""); require(ok, "ETH withdraw fail");
        } else {
            require(IERC20(paymentToken).transfer(it.recipient, amount), "ERC20 withdraw fail");
        }
        emit Withdrawal(it.recipient, amount, paymentToken);
    }

    function withdrawPlatform() external nonReentrant {
        require(platformFeeRecipient != address(0), "no platform");
        if (paymentToken == address(0)) {
            uint256 amt = platformOwedETH; require(amt > 0, "no ETH"); platformOwedETH = 0;
            (bool ok, ) = platformFeeRecipient.call{value: amt}(""); require(ok, "ETH xfer fail");
        } else {
            uint256 amt = platformOwedERC20; require(amt > 0, "no ERC20"); platformOwedERC20 = 0;
            require(IERC20(paymentToken).transfer(platformFeeRecipient, amt), "ERC20 xfer fail");
        }
    }

    /* Metadata */
    function uri(uint256 id) public view override returns (string memory) { return tokenURIs[id]; }
    function setURI(uint256 id, string memory newUri) external onlyOwner { require(items[id].exists, "no item"); tokenURIs[id] = newUri; emit URISet(id, newUri); }

    /* Interfaces */
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, ERC2981)
        returns (bool)
    { return super.supportsInterface(interfaceId); }

    receive() external payable { revert(); }
    fallback() external payable { revert(); }
}