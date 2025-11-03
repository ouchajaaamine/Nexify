pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Ensure a clean workspace to avoid stale vendor/config artifacts
                deleteDir()
                checkout scm
            }
        }
        
        stage('Backend Dependencies') {
            agent {
                docker {
                    image 'php:8.2-cli'
                }
            }
            steps {
                dir('backend') {
                    sh '''
                        apt-get update -qq
                        apt-get install -y -qq git unzip
                        curl -sS https://getcomposer.org/installer | php
                        php composer.phar install --no-interaction --prefer-dist --no-progress
                    '''
                }
            }
        }
        
        stage('Trivy: Scan Composer Dependencies') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint=""'
                }
            }
            steps {
                dir('backend') {
                    sh '''
                        trivy fs \
                            --scanners vuln \
                            --severity CRITICAL,HIGH,MEDIUM \
                            --format table \
                            --output trivy-composer-report.json \
                            --exit-code 0 \
                            .
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'backend/trivy-composer-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('PHPStan Analysis') {
            agent {
                docker {
                    image 'php:8.2-cli'
                }
            }
            steps {
                dir('backend') {
                    // Keep CI simple and deterministic: use the committed phpstan.dist.neon
                    sh 'vendor/bin/phpstan analyse -c phpstan.dist.neon --error-format=table --no-progress --memory-limit=512M'
                }
            }
        }
        
        stage('PHPUnit Tests') {
            agent {
                docker {
                    image 'php:8.2-cli'
                }
            }
            steps {
                dir('backend') {
                    sh 'vendor/bin/phpunit --log-junit test-results.xml'
                }
            }
            post {
                always {
                    junit 'backend/test-results.xml'
                }
            }
        }
        
        stage('Trivy: Scan Frontend Dependencies') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint=""'
                }
            }
            steps {
                dir('frontend') {
                    sh '''
                        trivy fs \
                            --scanners vuln \
                            --severity CRITICAL,HIGH,MEDIUM \
                            --format table \
                            --output trivy-frontend-report.json \
                            --exit-code 0 \
                            .
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/trivy-frontend-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('Frontend Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir('frontend') {
                    sh '''
                        corepack enable
                        corepack prepare pnpm@latest --activate
                        pnpm install
                        pnpm run build
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh '''
                        docker build -t Nexify-backend:latest ./backend
                        docker build -t Nexify-frontend:latest ./frontend
                    '''
                }
            }
        }
        
        stage('Trivy: Scan Docker Images') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint="" -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                sh '''
                    echo "Scanning Backend Image..."
                    trivy image \
                        --severity CRITICAL,HIGH,MEDIUM \
                        --format table \
                        --output trivy-backend-image.json \
                        --exit-code 0 \
                        Nexify-backend:latest
                    
                    echo "Scanning Frontend Image..."
                    trivy image \
                        --severity CRITICAL,HIGH,MEDIUM \
                        --format table \
                        --output trivy-frontend-image.json \
                        --exit-code 0 \
                        Nexify-frontend:latest
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-*-image.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('Authenticate to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 911541042693.dkr.ecr.eu-west-3.amazonaws.com
                    '''
                }
            }
        }
        
        stage('Tag and Push to ECR') {
            steps {
                sh '''
                    COMMIT_SHA=$(git rev-parse --short HEAD)
                    
                    docker tag Nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:$COMMIT_SHA
                    docker tag Nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:latest
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:$COMMIT_SHA
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:latest
                    
                    docker tag Nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:$COMMIT_SHA
                    docker tag Nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:latest
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:$COMMIT_SHA
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:latest
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Build completed successfully'
        }
        failure {
            echo 'Build failed'
        }
        always {
            cleanWs()
        }
    }
}