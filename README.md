# Firebase Studio

## **CRITICAL: How to Fix "Missing or insufficient permissions"**

You are seeing this error because your database security rules **must be deployed**. Your project code contains the correct rules in `firestore.rules`, but they are not yet active on your live database.

To deploy the secure rules and fix this error permanently, Run the following command in your terminal:

```bash
firebase deploy --only firestore:rules
```

After you run this command and see "Deploy complete!", the permission errors will be resolved.
