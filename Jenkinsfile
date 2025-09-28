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
    skipDefaultCheckout(true) // We will handle checkout manually
  }

  stages {
    stage('Checkout') {
      steps {
        // Checkout the specific branch
        git branch: 'signup_page_change', url: 'https://github.com/Thilina-Perera/studio.git'
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'npm run test'
        junit testResults: 'test-results/junit.xml'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('E2E Tests') {
      options {
        timeout(time: 15, unit: 'MINUTES')
      }
      steps {
        // Cypress/Playwright E2E tests (make sure package.json has "e2e" script)
        sh 'npm run e2e'
        // Publish E2E test results (adjust glob to match your reporter config)
        junit allowEmptyResults: true, testResults: 'test-results/cypress-*.xml'
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '.next/**, next.config.ts, tsconfig.json, package.json', fingerprint: true, allowEmptyArchive: true
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
