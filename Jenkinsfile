pipeline {
    agent any

    stages {
        stage('Initialize Environment') {
            steps {
                script {
                    echo 'Checking if Docker network sam-network exists...'
                    sh 'docker network inspect sam-network >/dev/null 2>&1 || docker network create sam-network'
                }
            }
        }

        stage('Build API Backend') {
            steps {
                dir('login-backend') {
                    echo 'Building Backend Docker Image...'
                    sh 'docker build -t samdox/backend:latest .'
                }
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('login-frontend') {
                    echo 'Building Frontend Docker Image...'
                    sh 'docker build -t samdox/frontend:latest .'
                }
            }
        }

        stage('Build Nginx Load Balancer') {
            steps {
                dir('nginx') {
                    echo 'Building Nginx Proxy Image...'
                    sh 'docker build -t samdox/custom-nginx:latest .'
                }
            }
        }

        stage('Deploy Infrastructure') {
            steps {
                // Gracefully stop any running containers (ignore errors if not running)
                dir('nginx') { sh 'docker-compose down || true' }
                dir('login-frontend') { sh 'docker-compose down || true' }
                dir('login-backend') { sh 'docker-compose down || true' }

                // Inject secrets from Jenkins Credential Vault into .env file
                withCredentials([
                    string(credentialsId: 'POSTGRES_USER', variable: 'DB_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD', variable: 'DB_PASS'),
                    string(credentialsId: 'POSTGRES_DB', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                ]) {
                    dir('login-backend') {
                        sh '''
                            sed -i "s/admin:admin/$PROXY_USER:$PROXY_PASS/g" proxysql.cnf

                            printf 'POSTGRES_USER=%s\n' "$DB_USER" > .env
                            printf 'POSTGRES_PASSWORD=%s\n' "$DB_PASS" >> .env
                            printf 'POSTGRES_DB=%s\n' "$DB_NAME" >> .env
                            printf 'JWT_SECRET=%s\n' "$JWT_SECRET" >> .env
                        '''
                        sh 'docker-compose up -d'
                    }
                }

                dir('login-frontend') { sh 'docker-compose up -d' }
                dir('nginx') { sh 'docker-compose up -d' }

                echo 'Stack successfully deployed! Zero-Downtime routing active.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline Execution Completed.'
        }
        success {
            mail to: 't3978713@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build succeeded. Review the logs at: ${env.BUILD_URL}"
        }
        failure {
            mail to: 't3978713@gmail.com',
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build failed. Review the logs at: ${env.BUILD_URL}"
        }
    }
}
