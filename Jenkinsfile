pipeline {
    agent any

    tools {
        // Configure a NodeJS installation with this exact name under
        // Manage Jenkins > Tools > NodeJS installations (needs the
        // "NodeJS" plugin). Any Node 20+ install works.
        nodejs 'NodeJS'
    }

    options {
        // Keep the last 10 builds instead of growing forever.
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Type-check + build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} succeeded for ${env.GIT_BRANCH ?: 'unknown branch'}."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed — check the stage logs above."
        }
        always {
            // dist/ is only useful for this run, no need to keep it around
            // as a workspace artifact between builds.
            cleanWs()
        }
    }
}
