# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment Instructions

### Fixing Firestore Permissions

If you are seeing a "Missing or insufficient permissions" error, it means your database security rules need to be deployed. Run the following command in your terminal to fix this:

```bash
firebase deploy --only firestore:rules
```
