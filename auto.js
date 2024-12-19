const { ethers } = require("ethers");

// Configuration
const arbSepoliaRPC = "https://endpoints.omniatech.io/v1/arbitrum/sepolia/public";
const baseSepoliaRPC = "https://sepolia.base.org";
const bridgeContractAddress = "0x8D86c3573928CE125f9b2df59918c383aa2B514D";
const privateKey = "YOUR_PRIVATE_KEY"; // Replace with your wallet's private key

// Setup Providers and Wallet
const arbProvider = new ethers.JsonRpcProvider(arbSepoliaRPC);
const wallet = new ethers.Wallet(privateKey, arbProvider);

// Bridge Contract ABI
const bridgeABI = [
  "function bridgeETH(uint256 amount) public payable returns (bool)"
];

// Function to Bridge ETH
async function bridgeETH(transactionNumber) {
  try {
    // Initialize the bridge contract
    const bridgeContract = new ethers.Contract(bridgeContractAddress, bridgeABI, wallet);

    // Amount to bridge (e.g., 0.11 ETH)
    const amount = ethers.parseEther("0.11");

    console.log(`Starting transaction ${transactionNumber}: Bridging ETH...`);
    
    // Estimate gas and send the transaction
    const gasEstimate = await bridgeContract.estimateGas.bridgeETH(amount, { value: amount });
    const bridgeTx = await bridgeContract.bridgeETH(amount, {
      value: amount,
      gasLimit: gasEstimate,
    });

    console.log(`Transaction ${transactionNumber} sent. Waiting for confirmation...`);
    await bridgeTx.wait();
    console.log(`Transaction ${transactionNumber} successful: ${bridgeTx.hash}`);
  } catch (error) {
    console.error(`Error in transaction ${transactionNumber}:`, error);
  }
}

// Execute 100 Transactions
async function executeMultipleTransactions() {
  for (let i = 1; i <= 100; i++) {
    await bridgeETH(i);
    // Optional: Add a delay between transactions if needed
    // await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay
  }
}

// Start the process
executeMultipleTransactions();
