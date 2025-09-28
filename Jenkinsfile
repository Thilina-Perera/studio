pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Thilina-Perera/studio.git'
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    // Use Node.js version from .nvmrc or default to 18
                    def nodeVersion = readFile('.nvmrc').trim()
                    if (nodeVersion) {
                        env.NODE_VERSION = nodeVersion
                    }
                    
                    // Setup Node.js
                    sh """
                    nvm install ${env.NODE_VERSION}
                    nvm use ${env.NODE_VERSION}
                    node --version
                    npm --version
                    """
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh """
                npm ci --silent
                """
            }
        }
        
        stage('TypeScript Compilation') {
            steps {
                sh """
                npm run build
                """
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh """
                npm test -- --coverage --watchAll=false
                """
            }
            post {
                always {
                    junit 'junit.xml'
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Linting') {
            steps {
                sh """
                npm run lint || true  # Continue even if linting fails
                """
            }
        }
        
        stage('Security Audit') {
            steps {
                sh """
                npm audit --audit-level moderate || true
                """
            }
        }
    }
    
    post {
        always {
            // Clean up and archive artifacts
            archiveArtifacts artifacts: 'build/**/*'
            
            // Send notifications
            emailext (
                subject: "Build ${currentBuild.result?: 'SUCCESS'} - ${env.JOB_NAME}",
                body: "Build URL: ${env.BUILD_URL}",
                to: "developer@example.com"
            )
        }
    }
}