
import { defineConfig } from 'cypress';
import { execSync } from 'child_process';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9002',
    supportFile: false,
    setupNodeEvents(on, config) {
      on('task', {
        clearFirestore: () => {
          try {
            // Replace `reimburse-ai-dev` with your actual Firebase project ID if it's different
            const command = `curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/reimburse-ai-dev/databases/(default)/documents"`;
            execSync(command);
            return null;
          } catch (e) {
            console.error("Failed to clear Firestore emulator:", e);
            return e;
          }
        },
      });
    },
  },
});
