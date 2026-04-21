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

                // Inject secrets from Jenkins Credential Vault into .env file
                withCredentials([
                    string(credentialsId: 'POSTGRES_USER', variable: 'DB_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD', variable: 'DB_PASS'),
                    string(credentialsId: 'POSTGRES_DB', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'PROXYSQL_ADMIN_USER', variable: 'PROXY_USER'),
                    string(credentialsId: 'PROXYSQL_ADMIN_PASS', variable: 'PROXY_PASS')
                ]) {
                    // Part 1: Deploy Database and ProxySQL
                    dir('db') {
                        echo 'Configuring ProxySQL and DB Environment...'
                        sh '''
                            sed -i "s/admin:admin/$PROXY_USER:$PROXY_PASS/g" proxysql.cnf

                            printf 'POSTGRES_USER=%s\n' "$DB_USER" > .env
                            printf 'POSTGRES_PASSWORD=%s\n' "$DB_PASS" >> .env
                            printf 'POSTGRES_DB=%s\n' "$DB_NAME" >> .env
                        '''
                        sh 'docker rm -f postgres_db proxysql || true'
                        sh 'docker-compose up -d'
                    }

                    // Part 2: Sequential Rolling Update for Backends
                    dir('login-backend') {
                        echo 'Configuring Backend Environment...'
                        sh '''
                            printf 'POSTGRES_USER=%s\n' "$DB_USER" > .env
                            printf 'POSTGRES_PASSWORD=%s\n' "$DB_PASS" >> .env
                            printf 'POSTGRES_DB=%s\n' "$DB_NAME" >> .env
                            printf 'JWT_SECRET=%s\n' "$JWT_SECRET" >> .env
                        '''
                        
                        echo 'Applying update to Backend 1...'
                        sh 'docker-compose up -d --no-deps backend1'
                        
                        echo 'Waiting for Backend 1 to stabilize (15s)...'
                        sleep time: 15, unit: 'SECONDS'
                        
                        echo 'Applying update to Backend 2...'
                        sh 'docker-compose up -d --no-deps backend2'
                        
                        echo 'Waiting for Backend 2 to stabilize (15s)...'
                        sleep time: 15, unit: 'SECONDS'
                    }
                }

                dir('login-frontend') { sh 'docker-compose up -d' }
                dir('nginx') { sh 'docker-compose up -d' }

                echo 'Stack successfully deployed! Zero-Downtime backend update complete with split infra.'
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
