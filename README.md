# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Deployment Instructions

### **CRITICAL: Fixing "Missing or insufficient permissions"**

If you are seeing a "Missing or insufficient permissions" error, it means your database security rules **must be deployed**. Your project's code contains the correct rules in `firestore.rules`, but they are not yet active on your live database.

To deploy the secure rules and fix this error, run the following command in your terminal:

```bash
firebase deploy --only firestore:rules
```

After deploying, the permission errors will be resolved.
