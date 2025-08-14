export const contractAddress = "0x584f1c676445707E3AF1A16b4B78186E445A8C93";
export const contractABI = [
			{
				"inputs": [],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "balance",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "needed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					}
				],
				"name": "ERC1155InsufficientBalance",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "approver",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidApprover",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "idsLength",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "valuesLength",
						"type": "uint256"
					}
				],
				"name": "ERC1155InvalidArrayLength",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidOperator",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "receiver",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidReceiver",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidSender",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					}
				],
				"name": "ERC1155MissingApprovalForAll",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "numerator",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "denominator",
						"type": "uint256"
					}
				],
				"name": "ERC2981InvalidDefaultRoyalty",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "receiver",
						"type": "address"
					}
				],
				"name": "ERC2981InvalidDefaultRoyaltyReceiver",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "numerator",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "denominator",
						"type": "uint256"
					}
				],
				"name": "ERC2981InvalidTokenRoyalty",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "receiver",
						"type": "address"
					}
				],
				"name": "ERC2981InvalidTokenRoyaltyReceiver",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					}
				],
				"name": "OwnableInvalidOwner",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					}
				],
				"name": "OwnableUnauthorizedAccount",
				"type": "error"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"name": "ApprovalForAll",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "recipient",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint96",
						"name": "royalty",
						"type": "uint96"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "metadataUri",
						"type": "string"
					}
				],
				"name": "ItemCreated",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "buyer",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "ItemPurchased",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "buyer",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "ItemPurchasedForLibrary",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "accessEndTime",
						"type": "uint256"
					}
				],
				"name": "NFTRented",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "previousOwner",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "newOwner",
						"type": "address"
					}
				],
				"name": "OwnershipTransferred",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					},
					{
						"indexed": false,
						"internalType": "uint256[]",
						"name": "values",
						"type": "uint256[]"
					}
				],
				"name": "TransferBatch",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "value",
						"type": "uint256"
					}
				],
				"name": "TransferSingle",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": false,
						"internalType": "string",
						"name": "value",
						"type": "string"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "URI",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "recipient",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "Withdrawal",
				"type": "event"
			},
			{
				"stateMutability": "payable",
				"type": "fallback"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"name": "accessCount",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"name": "accessRegistry",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "accessEndTime",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "balanceOf",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address[]",
						"name": "accounts",
						"type": "address[]"
					},
					{
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					}
				],
				"name": "balanceOfBatch",
				"outputs": [
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "checkBalance",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					}
				],
				"name": "cleanExpiredAccess",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "royaltyRecipient",
						"type": "address"
					},
					{
						"internalType": "uint96",
						"name": "royaltyValue",
						"type": "uint96"
					},
					{
						"internalType": "string",
						"name": "metadataUri",
						"type": "string"
					}
				],
				"name": "createItem",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "getAccessInfo",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "availableNFTs",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "accessedNFTs",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "hasAccess",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					}
				],
				"name": "isApprovedForAll",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"name": "items",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "balance",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					},
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					},
					{
						"internalType": "bytes",
						"name": "",
						"type": "bytes"
					}
				],
				"name": "onERC1155BatchReceived",
				"outputs": [
					{
						"internalType": "bytes4",
						"name": "",
						"type": "bytes4"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "",
						"type": "bytes"
					}
				],
				"name": "onERC1155Received",
				"outputs": [
					{
						"internalType": "bytes4",
						"name": "",
						"type": "bytes4"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "owner",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "purchaseItem",
				"outputs": [],
				"stateMutability": "payable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "purchaseItemForLibrary",
				"outputs": [],
				"stateMutability": "payable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "renounceOwnership",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "rentAccess",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "salePrice",
						"type": "uint256"
					}
				],
				"name": "royaltyInfo",
				"outputs": [
					{
						"internalType": "address",
						"name": "receiver",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256[]",
						"name": "values",
						"type": "uint256[]"
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes"
					}
				],
				"name": "safeBatchTransferFrom",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes"
					}
				],
				"name": "safeTransferFrom",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"name": "setApprovalForAll",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "newuri",
						"type": "string"
					}
				],
				"name": "setURI",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "bytes4",
						"name": "interfaceId",
						"type": "bytes4"
					}
				],
				"name": "supportsInterface",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "newOwner",
						"type": "address"
					}
				],
				"name": "transferOwnership",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "uri",
				"outputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "withdrawFunds",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"stateMutability": "payable",
				"type": "receive"
			}
		]
