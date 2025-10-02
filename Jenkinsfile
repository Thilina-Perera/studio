pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Checkout the source code from your repository
                // Example for Git:
                // git 'https://your-git-repository.com/your-project.git'
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            when {
                branch 'unit_testing'
            }
            steps {
                sh 'npm test'
            }
        }
    }
}
