
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
                // Run your Cypress End-to-End tests
                // This command runs the tests in headless mode
                sh 'npx cypress run'
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
