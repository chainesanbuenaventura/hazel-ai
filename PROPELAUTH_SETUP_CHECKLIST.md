# PropelAuth Setup Checklist

## ✅ Code Changes Applied

All code changes have been made to redirect to `/dashboard` after login.

## 🔧 PropelAuth Dashboard Settings (MUST CHECK)

Go to your PropelAuth Dashboard: https://app.propelauth.com/

### 1. Frontend Integration Settings

Navigate to: **Integration** → **Frontend Integration**

Check these settings:

#### Application URL
- **Test Environment**: Should be `http://localhost:3000`
- **Production**: Should be your production URL

#### Default Redirect Path After Login
- Set this to: `/dashboard`
- This is the KEY setting that controls where users go after login

#### Default Redirect Path After Logout  
- Set this to: `/`

### 2. Callback URLs

Navigate to: **Integration** → **Backend Integration** (or **Callback URLs**)

Ensure you have:
- `http://localhost:3000/api/auth/callback` (for local dev)
- `https://your-production-domain.com/api/auth/callback` (for production)

### 3. Test Environment

If you're seeing the green "Test Environment" page, it means PropelAuth doesn't know where to redirect you.

The fix is **EITHER**:
1. Set "Default Redirect Path After Login" to `/dashboard` in PropelAuth dashboard
2. OR ensure our code properly handles the callback (which we've now done)

## 🧪 Testing

After making changes:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cookies/cache** for `localhost:3000` and `041587514.propelauthtest.com`

3. **Test login flow**:
   - Go to `http://localhost:3000`
   - Click "Sign in" or "Get started"
   - You should go to PropelAuth hosted page
   - After login, you should land on `http://localhost:3000/dashboard`
   - NOT the green test page

4. **Check console logs**:
   - Open browser DevTools → Console
   - You should see:
     ```
     [Auth] Building login URL to: https://041587514.propelauthtest.com/login
     [PropelAuth] Redirecting to /dashboard
     ```

## 🐛 If Still Not Working

1. Double-check PropelAuth Dashboard → Frontend Integration → "Default Redirect Path After Login" is set to `/dashboard`
2. Make sure `.env.local` has:
   ```
   NEXT_PUBLIC_AUTH_URL=https://041587514.propelauthtest.com
   PROPELAUTH_API_KEY=...
   PROPELAUTH_VERIFIER_KEY=...
   ```
3. Restart dev server
4. Clear cookies
5. Try again

## 📝 What Changed

- `lib/propelauth.ts`: Always returns `/dashboard` in `postLoginRedirectPathFn`
- `lib/auth-utils.ts`: Simplified to not pass redirect params (PropelAuth handles it)
- `middleware.ts`: Simplified to redirect to PropelAuth without params
- All components: Use simplified auth utils

The flow is now:
1. User clicks login/signup → Goes to PropelAuth hosted page (no params)
2. User completes auth → PropelAuth calls `/api/auth/callback`
3. Our `postLoginRedirectPathFn` returns `/dashboard`
4. User lands on `/dashboard`
