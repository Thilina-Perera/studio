
pipeline {
    agent any

    // Automatically install and configure NodeJS. 
    // This removes the need for manual Jenkins tool configuration.
    tools {
        nodejs '20.10.0'
    }

    environment {
        // Define a variable for the Cypress browser
        CYPRESS_BROWSER = 'chrome'
    }

    stages {
        stage('Setup') {
            steps {
                // The 'nodejs' tool is now automatically in the PATH.
                cleanWs()
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    try {
                        // Start the Next.js app and the Firestore emulator in the background
                        sh 'npm run dev &'
                        sh 'firebase emulators:start --only firestore &'
                        
                        // Wait for the app to be fully ready before starting tests
                        sh 'npx wait-on http://localhost:9002'

                        // Run the Cypress tests
                        sh "npx cypress run --browser ${CYPRESS_BROWSER}"
                    } catch (e) {
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        // Use OS-specific commands to kill the background processes
                        if (isUnix()) {
                            sh 'kill $(lsof -t -i:9002) || true'
                            sh 'kill $(lsof -t -i:8080) || true'
                        } else {
                            // For Windows, use the 'bat' step.
                            bat """for /f "tokens=5" %%a in ('netstat -aon ^| findstr "9002"') do taskkill /F /PID %%a"""
                            bat """for /f "tokens=5" %%a in ('netstat -aon ^| findstr "8080"') do taskkill /F /PID %%a"""
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Archive test results and screenshots for later analysis
            archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true

            // Use the JUnit plugin to publish test results
            junit 'cypress/results/*.xml'
        }
    }
}
