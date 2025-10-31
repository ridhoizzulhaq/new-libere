import axios from 'axios';
import dayjs from 'dayjs';
import { createWalletClient, http, createPublicClient, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { contractABI, contractAddress } from './contract-abi.ts';

// Config from environment variables
const config = {
  privateKey: import.meta.env.VITE_OWNER_PRIVATE_KEY,
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretApiKey: import.meta.env.VITE_PINATA_SECRET_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseApiKey: import.meta.env.VITE_SUPABASE_API_KEY,
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || contractAddress,
  rpcUrl: import.meta.env.VITE_RPC_URL,
};

const USDC_DECIMALS = 6;

// Display contract address
document.getElementById('contractAddress').textContent = config.contractAddress;

// Form elements
const form = document.getElementById('publishForm');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');
const coverImageInput = document.getElementById('coverImage');
const coverPreview = document.getElementById('coverPreview');
const epubFileInput = document.getElementById('epubFile');
const epubInfo = document.getElementById('epubInfo');

// Preview cover image
coverImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      coverPreview.innerHTML = `<img src="${event.target.result}" alt="Cover Preview">`;
    };
    reader.readAsDataURL(file);
  }
});

// Show EPUB file info
epubFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    epubInfo.innerHTML = `📄 ${file.name} (${sizeMB} MB)`;
  }
});

// Show status message
function showStatus(message, type = 'loading') {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
}

function hideStatus() {
  statusDiv.className = 'status';
}

// Upload file to IPFS via Pinata
async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      headers: {
        'pinata_api_key': config.pinataApiKey,
        'pinata_secret_api_key': config.pinataSecretApiKey,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}

// Publish book
async function publishBook(formData) {
  try {
    // Validate private key
    if (!config.privateKey || config.privateKey === 'your_private_key_here') {
      throw new Error('⚠️ Please set VITE_OWNER_PRIVATE_KEY in .env file');
    }

    submitBtn.disabled = true;

    // Step 1: Upload cover image to IPFS
    showStatus('📤 Uploading cover image to IPFS...');
    const coverImage = formData.get('coverImage');
    const metadataUri = await uploadToIPFS(coverImage);
    console.log('✅ Cover uploaded:', metadataUri);

    // Step 2: Upload EPUB to IPFS
    showStatus('📤 Uploading EPUB file to IPFS...');
    const epubFile = formData.get('epubFile');
    const epubUri = await uploadToIPFS(epubFile);
    console.log('✅ EPUB uploaded:', epubUri);

    // Step 3: Prepare transaction data
    showStatus('⛓️ Preparing blockchain transaction...');
    const bookId = dayjs().unix();
    const priceInUSDC = Math.floor(Number(formData.get('price')) * Math.pow(10, USDC_DECIMALS));
    const royaltyPercent = Number(formData.get('royalty')) * 100; // Convert to basis points

    // Create wallet client with private key
    const account = privateKeyToAccount(config.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(config.rpcUrl),
    });

    const recipientAddress = account.address;

    console.log('📋 Book data:', {
      id: bookId,
      price: priceInUSDC,
      royalty: royaltyPercent,
      metadataUri,
      epubUri,
    });

    // Step 4: Send transaction to smart contract
    showStatus('⛓️ Publishing to blockchain (this may take a minute)...');
    const hash = await walletClient.sendTransaction({
      to: config.contractAddress,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: 'createItem',
        args: [
          BigInt(bookId),
          BigInt(priceInUSDC),
          recipientAddress,
          recipientAddress, // Same as royalty recipient
          royaltyPercent,
          metadataUri,
        ],
      }),
    });

    console.log('✅ Transaction hash:', hash);
    showStatus(`⏳ Waiting for transaction confirmation... (tx: ${hash.slice(0, 10)}...)`);

    // Wait for transaction receipt
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl),
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Transaction confirmed:', receipt);

    // Step 5: Save to Supabase
    showStatus('💾 Saving metadata to database...');
    const bookData = {
      id: bookId,
      title: formData.get('title'),
      author: formData.get('author'),
      publisher: formData.get('publisher') || '',
      description: formData.get('description') || '',
      metadataUri: metadataUri,
      epub: epubUri,
      priceEth: priceInUSDC.toString(),
      royalty: royaltyPercent,
      addressReciepent: recipientAddress,
      addressRoyaltyRecipient: recipientAddress,
    };

    await axios.post(`${config.supabaseUrl}/rest/v1/Book`, bookData, {
      headers: {
        apiKey: config.supabaseApiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Saved to database');

    // Success!
    showStatus(`🎉 Book published successfully! ID: ${bookId} | TX: ${hash}`, 'success');

    // Reset form after 3 seconds
    setTimeout(() => {
      form.reset();
      coverPreview.innerHTML = '';
      epubInfo.innerHTML = '';
      hideStatus();
      submitBtn.disabled = false;
    }, 3000);

  } catch (error) {
    console.error('❌ Publish failed:', error);
    showStatus(`❌ Error: ${error.message}`, 'error');
    submitBtn.disabled = false;
  }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await publishBook(formData);
});

// Check if private key is set
window.addEventListener('DOMContentLoaded', () => {
  if (!config.privateKey || config.privateKey === 'your_private_key_here') {
    showStatus('⚠️ Warning: Private key not configured in .env file', 'error');
  }
});
