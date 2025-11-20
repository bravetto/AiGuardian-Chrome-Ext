/**
 * Bridge script injected into the page to access Clerk SDK.
 * Runs in the MAIN world (page context) to bypass extension isolation.
 */
(function() {
  // Prevent double injection
  if (window.__aiGuardianBridgeLoaded) return;
  window.__aiGuardianBridgeLoaded = true;

  const MAX_ATTEMPTS = 60; // 30 seconds
  let attempts = 0;

  function checkClerk() {
    attempts++;
    // Look for Clerk in the main window object
    const clerk = window.Clerk || window.clerk || window.__clerk;
    
    if (clerk && clerk.user) {
      // User found - extract data
      const sendData = async () => {
        try {
          let token = null;
          // Try to get a fresh token
          if (clerk.session) {
             try { token = await clerk.session.getToken(); } catch (e) { /* ignore */ }
          }
          
          // Send back to content script
          window.postMessage({
            type: 'AI_GUARDIAN_CLERK_DATA',
            payload: {
              user: {
                id: clerk.user.id,
                email: clerk.user.primaryEmailAddress?.emailAddress || clerk.user.emailAddresses?.[0]?.emailAddress,
                firstName: clerk.user.firstName,
                lastName: clerk.user.lastName,
                username: clerk.user.username,
                imageUrl: clerk.user.imageUrl || clerk.user.profileImageUrl
              },
              token: token
            }
          }, '*');
        } catch (e) {
          // console.error('Bridge extraction error:', e);
        }
      };

      sendData();
    } else if (attempts < MAX_ATTEMPTS) {
      // Keep looking if Clerk hasn't initialized yet
      setTimeout(checkClerk, 500);
    }
  }

  checkClerk();
})();


