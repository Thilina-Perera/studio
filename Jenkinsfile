pipeline {
    agent {
        dockerfile true
    }

    environment {
        CYPRESS_BROWSER = 'chrome'
    }

    stages {
        stage('Run Tests') {
            steps {
                script {
                    try {
                        // Start the Next.js app and the Firestore emulator in the background
                        sh 'npm run dev &'
                        sh 'firebase emulators:start --only firestore &'
                        
                        // Wait for the app to be fully ready before starting tests
                        // The container environment is stable, so a fixed wait is reliable.
                        sleep(30)
                        
                        // Run Cypress tests. Since this is in a Docker container, we need the --no-sandbox flag for Chrome.
                        sh "npx cypress run --browser ${CYPRESS_BROWSER} --config-file cypress.config.js --config video=false,screenshotOnRunFailure=false --headless --spec 'cypress/e2e/smoke.cy.js'"
                    } catch (e) {
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        // The container will be automatically stopped and cleaned up by Jenkins, 
                        // so manual process killing is no longer necessary.
                    }
                }
            }
        }
    }

    post {
        always {
            // Archive test results and other artifacts
            archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true
            junit 'cypress/results/*.xml'
        }
    }
}
