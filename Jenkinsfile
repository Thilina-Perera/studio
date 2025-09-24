
pipeline {
    agent any

    environment {
        // Use a specific Node.js version for consistency
        NODEJS_VERSION = '20.10.0'
        // Define a variable for the Cypress browser
        CYPRESS_BROWSER = 'chrome'
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Clean the workspace to ensure no old files interfere
                    cleanWs()

                    // Use the NodeJS tool to manage the Node.js installation
                    def nodeHome = tool name: NODEJS_VERSION, type: 'nodejs'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                    
                    // Install project dependencies inside the script block
                    // to ensure the correct npm version is used.
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Use a try-catch-finally block to ensure cleanup happens
                    try {
                        // Start the Next.js app and the Firestore emulator in the background
                        sh 'npm run dev &'
                        sh 'firebase emulators:start --only firestore &'
                        
                        // Wait for the app to be fully ready before starting tests
                        sh 'npx wait-on http://localhost:9002'

                        // Run the Cypress tests
                        sh "npx cypress run --browser ${CYPRESS_BROWSER}"
                    } catch (e) {
                        // If any step in the try block fails, mark the build as failed
                        currentBuild.result = 'FAILURE'
                        throw e // Re-throw the exception to stop the pipeline
                    } finally {
                        // This block will run whether the try block succeeded or failed
                        // Use OS-specific commands to kill the background processes
                        if (isUnix()) {
                            sh 'kill $(lsof -t -i:9002) || true'
                            sh 'kill $(lsof -t -i:8080) || true'
                        } else {
                            // For Windows, use taskkill. The /F flag forces termination.
                            sh 'for /f "tokens=5" %a in ('netstat -aon ^| findstr "9002"') do taskkill /F /PID %a'
                            sh 'for /f "tokens=5" %a in ('netstat -aon ^| findstr "8080"') do taskkill /F /PID %a'
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

            // Use the JUnit plugin to publish test results, which helps in tracking test trends
            junit 'cypress/results/*.xml'
        }
    }
}
