pipeline {
    agent any

    environment {
        NETWORK_NAME = credentials('NETWORK_NAME')
    }

    stages {
        stage('Initialize Environment') {
            steps {
                script {
                    echo "Checking if Docker network ${NETWORK_NAME} exists..."
                    sh "docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || docker network create ${NETWORK_NAME}"
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
                dir('nginx') { sh 'docker-compose down' }
                dir('login-frontend') { sh 'docker-compose down' }
                dir('login-backend') { sh 'docker-compose down' }

                withCredentials([
                    string(credentialsId: 'POSTGRES_USER', variable: 'DB_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD', variable: 'DB_PASS'),
                    
                    string(credentialsId: 'POSTGRES_DB', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'PORT', variable: 'DB_PORT')
                ]) {
                    dir('login-backend') {
                        sh '''
                            echo "POSTGRES_USER=${DB_USER}" > .env
                            echo "POSTGRES_PASSWORD=${DB_PASS}" >> .env
                            echo "POSTGRES_DB=${DB_NAME}" >> .env
                            echo "JWT_SECRET=${JWT_SECRET}" >> .env
                            echo "PORT=${DB_PORT}" >> .env
                        '''

                        sh 'docker-compose up -d'
                    }
                }
                
                dir('login-frontend') { sh 'docker-compose up -d' }
                dir('nginx') { sh 'docker-compose up -d' }
                
                echo "Stack successfully deployed! Zero-Downtime routing active."
            }
        }
    }

    post {
        always {
            echo "Pipeline Execution Completed."
        }
        success {
            mail to: 'samarthp2003@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build succeeded. Review the logs at: ${env.BUILD_URL}"
        }
        failure {
            mail to: 'samarthp2003@gmail.com',
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build failed. Review the logs at: ${env.BUILD_URL}"
        }
    }
}
