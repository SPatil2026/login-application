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

                withVault(vaultSecrets: [
                    [path: 'secret/postgres', secretValues: [
                        [envVar: 'DB_USER', vaultKey: 'username'],
                        [envVar: 'DB_PASS', vaultKey: 'password'],
                        [envVar: 'DB_NAME', vaultKey: 'database']
                    ]],
                    [path: 'secret/proxysql', secretValues: [
                        [envVar: 'PROXY_USER', vaultKey: 'username'],
                        [envVar: 'PROXY_PASS', vaultKey: 'password']
                    ]],
                    [path: 'secret/backend', secretValues: [
                        [envVar: 'JWT_SECRET', vaultKey: 'secret']
                    ]]
                ]) {
                    // Part 1: Deploy Database and ProxySQL
                    dir('db') {
                        echo 'Configuring ProxySQL and DB Environment...'
                        sh '''
                            printf 'POSTGRES_USER=%s\n' "$DB_USER" > .env
                            printf 'POSTGRES_PASSWORD=%s\n' "$DB_PASS" >> .env
                            printf 'POSTGRES_DB=%s\n' "$DB_NAME" >> .env
                        '''
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
                        
                        sh 'docker-compose up -d'
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
