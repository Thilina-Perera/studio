pipeline {
    agent any

    environment {
        NODEJS_VERSION = '20.10.0'
        CYPRESS_BROWSER = 'chrome'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    cleanWs()
                    if (isUnix()) {
                        sh "wget https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz"
                        sh "tar -xf node-v${NODEJS_VERSION}-linux-x64.tar.xz"
                        def nodeDir = "${pwd()}/node-v${NODEJS_VERSION}-linux-x64/bin"
                        env.PATH = "${nodeDir}:${env.PATH}"
                    } else { // Windows
                        // Use PowerShell for downloading, as it's more reliable than curl on Windows
                        powershell "Invoke-WebRequest -Uri https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-win-x64.zip -OutFile node.zip"
                        powershell 'Expand-Archive -Path "node.zip" -DestinationPath "." -Force'
                        def nodeDir = "${pwd()}\node-v${NODEJS_VERSION}-win-x64"
                        env.PATH = "${nodeDir};${env.PATH}"
                    }
                    // Verify installation
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    try {
                        if (isUnix()) {
                            sh 'npm run dev &'
                            sh 'firebase emulators:start --only firestore &'
                            sh 'npx wait-on http://localhost:9002'
                            sh "npx cypress run --browser ${CYPRESS_BROWSER}"
                        } else {
                            bat 'start "dev" npm run dev'
                            bat 'start "firebase" firebase emulators:start --only firestore'
                            sleep(20) // Give servers a moment to start before waiting on the port
                            bat 'npx wait-on http://localhost:9002'
                            bat "npx cypress run --browser ${CYPRESS_BROWSER}"
                        }
                    } catch (e) {
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (isUnix()) {
                            sh 'kill $(lsof -t -i:9002) || true'
                            sh 'kill $(lsof -t -i:8080) || true'
                        } else {
                            bat 'for /f "tokens=5" %%a in (\'netstat -aon ^| findstr "9002"\') do taskkill /F /PID %%a'
                            bat 'for /f "tokens=5" %%a in (\'netstat -aon ^| findstr "8080"\') do taskkill /F /PID %%a'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true
            junit 'cypress/results/*.xml'
        }
    }
}
