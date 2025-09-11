// Debug script to help identify deployment issues
console.log('🔍 Debug script loaded successfully');

// Check if we're in production
console.log('🏗️  Environment:', {
  mode: typeof import !== 'undefined' ? 'module' : 'script',
  location: window.location.href,
  userAgent: navigator.userAgent.substring(0, 50) + '...'
});

// Test module loading
if (typeof import !== 'undefined') {
  console.log('✅ ES6 modules supported');
} else {
  console.log('❌ ES6 modules not supported');
}

// Check for common issues
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

// Test fetch availability
if (typeof fetch !== 'undefined') {
  console.log('✅ Fetch API available');
} else {
  console.log('❌ Fetch API not available');
}

// Check service worker status
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('🔧 Service Workers:', registrations.length, 'registered');
    registrations.forEach((reg, i) => {
      console.log(`SW ${i + 1}:`, reg.scope, 'state:', reg.active?.state);
    });
  });
} else {
  console.log('❌ Service Worker not supported');
}

console.log('🔍 Debug script completed');
