
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Get the code from your repository
                git branch: 'main', url: 'https://github.com/Thilina-Perera/studio.git'
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
                // Run your tests
                // You might need to add a "test" script to your package.json
                sh 'npm test'
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
                    // Since you have an apphosting.yaml, you are likely deploying to Google Cloud App Hosting.
                    // You would need to authenticate with gcloud and then run the deploy command.
                    echo "Deploying to production..."
                    // Example for Google Cloud App Hosting:
                    // withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GCLOUD_KEY_FILE')]) {
                    //     sh "gcloud auth activate-service-account --key-file=$GCLOUD_KEY_FILE"
                    //     sh "gcloud app deploy"
                    // }
                }
            }
        }
    }

    post {
        // This block runs after all the stages are completed
        always {
            echo 'Pipeline finished.'
            // You can add steps here for cleanup or sending notifications
        }
        success {
            echo 'Pipeline succeeded!'
            // Send a success notification (e.g., to Slack or email)
        }
        failure {
            echo 'Pipeline failed!'
            // Send a failure notification
        }
    }
}
