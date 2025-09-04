# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment Instructions

### Fixing Firestore Permissions

If you are seeing a "Missing or insufficient permissions" error, it means your database security rules need to be deployed. Your project currently contains two sets of rules:

1.  **Temporary Development Rules (currently active):** These rules are insecure and allow any logged-in user to access all data. They are intended only to get you started.

2.  **Secure Production Rules:** These rules are defined in the file `firestore.rules.secure` and are designed for a production environment.

To deploy the **secure** rules, run the following command in your terminal:

```bash
firebase deploy --only firestore:rules
```

After deploying, you can rename `firestore.rules.secure` to `firestore.rules` if you wish to keep your project tidy.
