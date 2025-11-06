# Authentication Context Migration Guide

## 🎯 What's Changed

We've consolidated the authentication system from **3 contexts** to **2 contexts**:

### ❌ Before (Complex)
```typescript
// Had to use multiple hooks for complete auth info
const { isAuthenticated } = useAuth();        // Auth state only
const { user } = useUserSession();            // User data only
const { tenant } = useTenant();               // Tenant data
```

### ✅ After (Simplified)
```typescript
// Single hook for everything auth-related
const { isAuthenticated, user } = useUserDetails();  // Both auth state AND user data
const { tenant } = useTenant();                      // Tenant data
```

## 🔄 Migration Steps

### 1. Update Imports
```typescript
// ❌ Old imports
import { useAuth } from '@/contexts/AuthContext';
import { useUserSession } from '@/contexts/UserSessionContext';

// ✅ New imports
import { useUserDetails, useUserId, useUserDisplayName } from '@/contexts/UserDetailsContext';
```

### 2. Update Hook Usage

#### Authentication State
```typescript
// ❌ Before
const { isAuthenticated } = useAuth();

// ✅ After
const { isAuthenticated } = useUserDetails();
```

#### User Data
```typescript
// ❌ Before
const { user } = useUserSession();
const userId = user?.userId;

// ✅ After
const { user } = useUserDetails();
const userId = useUserId(); // Or user?.userId
```

#### Complete Auth Check
```typescript
// ❌ Before - Had to check both
const { isAuthenticated } = useAuth();
const { user } = useUserSession();
if (isAuthenticated && user) {
  // User is logged in with data
}

// ✅ After - Single check
const { isAuthenticated, user } = useUserDetails();
if (isAuthenticated && user) {
  // User is logged in with data
}
```

### 3. Update Login/Logout
```typescript
// ❌ Before
import { useAuth } from '@/contexts/AuthContext';
const { login, logout } = useAuth();

// ✅ After
import { useUserDetails } from '@/contexts/UserDetailsContext';
const { login, logout } = useUserDetails();
```

## 🏗️ Context Architecture

### UserDetailsProvider
**Provides:**
- ✅ `isAuthenticated` - Authentication state
- ✅ `user` - Full user profile (name, email, role, etc.)
- ✅ `isLoading` - Loading states
- ✅ `error` - Error messages
- ✅ `login()` - Login function
- ✅ `logout()` - Logout function
- ✅ `checkAuth()` - Manual auth check

### TenantProvider
**Provides:**
- ✅ `tenant` - Tenant information
- ✅ `company` - Company details
- ✅ `currency` - Currency settings

## 🔧 Convenience Hooks

The following hooks work with the new system:

```typescript
import {
  useUserDetails,      // Main hook
  useUserId,           // Quick user ID access
  useUserDisplayName,  // Quick display name access
  useUserRole,         // Quick role access
  useIsAuthenticated,  // Quick auth state
} from '@/contexts/UserDetailsContext';
```

## 🔄 Backward Compatibility

**Existing code will continue to work** during migration:

```typescript
// This still works (with console warning)
const { user } = useUserSession(); // ⚠️ Deprecated but functional
```

## 📋 Files Updated

- ✅ `src/contexts/UserDetailsContext.tsx` - New consolidated context
- ✅ `src/app/[locale]/(app)/layout.tsx` - Uses UserDetailsProvider
- ✅ `src/app/[locale]/(auth)/layout.tsx` - Uses UserDetailsProvider
- ✅ `src/app/dashboard/layout.tsx` - Uses UserDetailsProvider

## 🧪 Testing

Test these scenarios after migration:

1. **Login Flow**: User can login and see their data
2. **Page Navigation**: Auth state persists across navigation
3. **Logout Flow**: User data clears properly
4. **Middleware Protection**: Unauthenticated users redirected

## 🎯 Benefits

- **Simpler API**: One hook for auth state + user data
- **Better Performance**: Fewer context lookups
- **Type Safety**: Stronger TypeScript support
- **Maintainability**: Less code duplication
- **Consistency**: Single source of truth for user data

## 📞 Need Help?

If you encounter issues:
1. Check browser console for deprecated warnings
2. Use `useUserDetails()` instead of separate hooks
3. Verify middleware is still protecting routes
4. Test login/logout flows thoroughly
