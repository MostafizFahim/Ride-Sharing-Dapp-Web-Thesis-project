export const RIDE_SHARING_ADDRESS =
  "0x1a9ABDF90022429AF8Db924af3027655Fe77e340";

export const RIDE_SHARING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "cancelRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "completeRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "matchRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  { inputs: [], name: "NotIPFSURI", type: "error" },
  { inputs: [], name: "NotRiderOrDriver", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "payForRide",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  { inputs: [], name: "PriceIsZero", type: "error" },

  {
    inputs: [
      { internalType: "uint256", name: "rideId", type: "uint256" },
      { internalType: "uint256", name: "riderRating", type: "uint256" },
      { internalType: "uint256", name: "driverRating", type: "uint256" },
    ],
    name: "rateRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },

  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address", name: "driver", type: "address" },
      { internalType: "uint256", name: "fareWei", type: "uint256" },
      { internalType: "string", name: "metadataURI", type: "string" },
    ],
    name: "requestRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "RideAlreadyStarted",
    type: "error",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "RideNotFound",
    type: "error",
  },

  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      { internalType: "uint256", name: "expected", type: "uint256" },
      { internalType: "uint256", name: "provided", type: "uint256" },
    ],
    name: "WrongPayment",
    type: "error",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
    ],
    name: "RideCancelled",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
    ],
    name: "RideCompleted",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "driver",
        type: "address",
      },
    ],
    name: "RideMatched",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountWei",
        type: "uint256",
      },
    ],
    name: "RidePaymentReceived",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "riderRating",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "driverRating",
        type: "uint256",
      },
    ],
    name: "RideRated",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "rider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fareWei",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataURI",
        type: "string",
      },
    ],
    name: "RideRequested",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rideId",
        type: "uint256",
      },
    ],
    name: "RideStarted",
    type: "event",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "startRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "getRideDetails",
    outputs: [
      {
        components: [
          { internalType: "address", name: "rider", type: "address" },
          { internalType: "address", name: "driver", type: "address" },
          { internalType: "uint256", name: "fareWei", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "string", name: "status", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
        ],
        internalType: "struct RideSharing.Ride",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "string", name: "uri", type: "string" }],
    name: "isIPFSURI",
    outputs: [{ internalType: "bool", name: "" }],
    stateMutability: "pure",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "rideId", type: "uint256" }],
    name: "isRideStarted",
    outputs: [{ internalType: "bool", name: "" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "rideCount",
    outputs: [{ internalType: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rides",
    outputs: [
      { internalType: "address", name: "rider", type: "address" },
      { internalType: "address", name: "driver", type: "address" },
      { internalType: "uint256", name: "fareWei", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "string", name: "status", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
