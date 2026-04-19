// Test backend modules
console.log('Testing backend modules...');
try {
  require('./backend/src/controllers/jobController');
  require('./backend/src/controllers/userController');
  console.log('✅ All backend modules loaded OK');
} catch(e) {
  console.error('❌ ERROR:', e.message);
  process.exit(1);
}
