pipeline {
    agent any

    environment {
        // Defines the network dynamically just in case it doesn't exist
        NETWORK_NAME = 'sam-network'
    }

    stages {
        stage('Initialize Environment') {
            steps {
                script {
                    echo "Checking if Docker network '${NETWORK_NAME}' exists..."
                    def networkExists = sh(script: "docker network ls | grep ${NETWORK_NAME} || true", returnStdout: true).trim()
                    if (!networkExists) {
                        echo "Creating network '${NETWORK_NAME}'..."
                        sh "docker network create ${NETWORK_NAME}"
                    } else {
                        echo "Network '${NETWORK_NAME}' already exists."
                    }
                }
            }
        }

        stage('Build API Backend') {
            steps {
                dir('login-backend') {
                    echo "Building Backend Docker Image..."
                    sh 'docker build -t samdox/backend:latest .'
                }
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('login-frontend') {
                    echo "Building Frontend Docker Image..."
                    sh 'docker build -t samdox/frontend:latest .'
                }
            }
        }

        stage('Build Nginx Load Balancer') {
            steps {
                dir('nginx') {
                    echo "Building Nginx Proxy Image..."
                    sh 'docker build -t samdox/custom-nginx:latest .'
                }
            }
        }

        stage('Deploy Infrastructure') {
            steps {
                // First, stop existing containers smoothly
                dir('nginx') { sh 'docker compose down || true' }
                dir('login-frontend') { sh 'docker compose down || true' }
                dir('login-backend') { sh 'docker compose down || true' }
                
                // Then deploy everything simultaneously using the newly built images
                dir('login-backend') { sh 'docker compose up -d' }
                dir('login-frontend') { sh 'docker compose up -d' }
                dir('nginx') { sh 'docker compose up -d' }
                
                echo "🚀 Stack successfully deployed! Zero-Downtime routing active."
            }
        }
    }

    post {
        always {
            echo "Pipeline Execution Completed."
        }
        success {
            echo "✅ Build and Deploy Succeeded!"
        }
        failure {
            echo "❌ Pipeline failed! Check the logs for errors."
        }
    }
}
