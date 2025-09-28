
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Checkout your source code from your repository
                // Example for Git:
                // git 'https://your-repo.com/project.git'
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Unit Tests') {
            steps {
                sh 'npm test -- --coverage'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    post {
        always {
            // Archive test results
            junit '**/junit.xml' // This path might need adjustment based on your test runner's output
        }
    }
}
