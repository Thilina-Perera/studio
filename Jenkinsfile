// Jenkinsfile (Declarative pipeline with Poll SCM + E2E)
pipeline {
  agent any

  environment {
    CI = 'true'
  }

  // Poll SCM every 5 minutes
  triggers {
    pollSCM('H/5 * * * *')
  }

  options {
    timestamps()
    ansiColor('xterm')
    skipDefaultCheckout(false)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'npm run test'
        junit allowEmptyResults: false, testResults: 'test-results/junit.xml'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('E2E Tests') {
      steps {
        // Cypress/Playwright E2E tests (make sure package.json has "e2e" script)
        sh 'npm run e2e'
        // Publish E2E test results (adjust glob to match your reporter config)
        junit allowEmptyResults: true, testResults: 'test-results/cypress-*.xml'
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '.next/**, out/**', fingerprint: true, allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'coverage/**, test-results/**', allowEmptyArchive: true
      cleanWs()
    }
    success {
      echo '✅ Pipeline succeeded'
    }
    failure {
      echo '❌ Pipeline failed'
    }
  }
}
