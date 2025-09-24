
pipeline {
    agent any

    environment {
        NODEJS_VERSION = '20.10.0'
        CYPRESS_BROWSER = 'chrome'
    }

    stages {
        stage('Setup Node.js') {
            steps {
                script {
                    cleanWs()
                    if (isUnix()) {
                        sh "wget https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz"
                        sh "tar -xf node-v${NODEJS_VERSION}-linux-x64.tar.xz"
                        env.PATH = "${pwd()}/node-v${NODEJS_VERSION}-linux-x64/bin:${env.PATH}"
                        sh 'node --version'
                        sh 'npm --version'
                    } else { // Assuming Windows
                        bat "curl.exe -L -o node.zip https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-win-x64.zip"
                        unzip 'node.zip'
                        env.PATH = "${pwd()}/node-v${NODEJS_VERSION}-win-x64;${env.PATH}"
                        bat 'node --version'
                        bat 'npm --version'
                    }
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
                        sh 'npm run dev &'
                        sh 'firebase emulators:start --only firestore &'
                        sh 'npx wait-on http://localhost:9002'
                        sh "npx cypress run --browser ${CYPRESS_BROWSER}"
                    } catch (e) {
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (isUnix()) {
                            sh 'kill $(lsof -t -i:9002) || true'
                            sh 'kill $(lsof -t -i:8080) || true'
                        } else {
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
            archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true
            junit 'cypress/results/*.xml'
        }
    }
}
