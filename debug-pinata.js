// Debug script to test Pinata upload
// Run this in browser console at http://localhost:3000/studio

console.log('=== Pinata Debug ===');
console.log('JWT exists:', !!process.env.NEXT_PUBLIC_PINATA_JWT);
console.log('JWT value:', process.env.NEXT_PUBLIC_PINATA_JWT ? 'SET' : 'NOT SET');

// Test if axios is loaded
console.log('Axios available:', typeof axios !== 'undefined');

// Check if hook exports correctly
console.log('Hook imports should work from @/hooks/usePinataUpload');
