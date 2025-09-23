
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Get the code from your repository
                git branch: 'master', url: 'https://github.com/Thilina-Perera/studio.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install npm packages
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Run your unit tests
                sh 'npm test'
            }
        }

        stage('E2E Tests') {
            steps {
                // Start the Next.js app in the background
                sh 'npm run dev &'
                // Wait for the app to start
                sh 'sleep 10'
                // Run your Cypress End-to-End tests
                sh 'npx cypress run'
            }
            post {
                always {
                    // Stop the Next.js app
                    sh 'kill $(lsof -t -i:9002)'
                }
            }
        }

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // This is a placeholder for your deployment steps.
                    echo "Deploying to production..."
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
