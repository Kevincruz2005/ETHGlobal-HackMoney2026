// Test Pinata IPFS Connection
// Run: node test-pinata.js

const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: '.env.local' });

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

async function testPinataConnection() {
    console.log('🔍 Testing Pinata IPFS Setup...\n');

    // 1. Check JWT exists
    console.log('1. Checking JWT...');
    if (!JWT) {
        console.error('❌ JWT not found in .env.local');
        console.log('   Make sure NEXT_PUBLIC_PINATA_JWT is set\n');
        return;
    }
    console.log('✅ JWT found:', JWT.substring(0, 20) + '...\n');

    // 2. Test Authentication
    console.log('2. Testing Pinata Authentication...');
    try {
        const authTest = await axios.get(
            'https://api.pinata.cloud/data/testAuthentication',
            {
                headers: {
                    'Authorization': `Bearer ${JWT}`
                }
            }
        );
        console.log('✅ Authentication successful!');
        console.log('   Message:', authTest.data.message);
    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
        return;
    }

    // 3. Test File Upload (small text file)
    console.log('\n3. Testing File Upload...');
    try {
        const formData = new FormData();
        const testContent = Buffer.from('Hello from NitroGate! This is a test upload.');
        formData.append('file', testContent, 'test.txt');

        const pinataMetadata = JSON.stringify({
            name: 'NitroGate Test Upload',
            keyvalues: {
                platform: 'NitroGate',
                test: 'true'
            }
        });
        formData.append('pinataMetadata', pinataMetadata);

        console.log('   Uploading test file to IPFS...');
        const uploadResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${JWT}`,
                    ...formData.getHeaders()
                }
            }
        );

        const ipfsHash = uploadResponse.data.IpfsHash;
        console.log('✅ Upload successful!');
        console.log('   IPFS Hash:', ipfsHash);
        console.log('   Pinata URL:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        console.log('   Public URL:', `https://ipfs.io/ipfs/${ipfsHash}`);

        // 4. Verify file is accessible
        console.log('\n4. Verifying file accessibility...');
        const verifyResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        console.log('✅ File is accessible!');
        console.log('   Content:', verifyResponse.data);

    } catch (error) {
        console.error('❌ Upload failed:', error.response?.data || error.message);
        return;
    }

    console.log('\n🎉 All tests passed! Your Pinata IPFS setup is working correctly.');
    console.log('   You can now upload videos through the NitroGate studio page.\n');
}

// Run the test
testPinataConnection().catch(console.error);
