pipeline {
    agent any
    
    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }
        
        stage('Parallel Build & Test') {
            parallel {
                stage('Backend Pipeline') {
                    agent {
                        docker {
                            image 'composer:2'
                            reuseNode true
                        }
                    }
                    stages {
                        stage('Backend: Install Dependencies') {
                            steps {
                                dir('backend') {
                                    sh 'composer install --no-interaction --prefer-dist --optimize-autoloader --no-progress'
                                }
                            }
                        }
                        
                        stage('Backend: Quality Checks') {
                            parallel {
                                stage('PHPStan') {
                                    steps {
                                        dir('backend') {
                                            sh 'vendor/bin/phpstan analyse -c phpstan.dist.neon --error-format=table --no-progress --memory-limit=512M'
                                        }
                                    }
                                }
                                
                                stage('PHPUnit') {
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
                            }
                        }
                    }
                }
                
                stage('Frontend Pipeline') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            reuseNode true
                        }
                    }
                    stages {
                        stage('Frontend: Install & Build') {
                            steps {
                                dir('frontend') {
                                    sh '''
                                        corepack enable
                                        corepack prepare pnpm@latest --activate
                                        pnpm install --frozen-lockfile
                                        pnpm run build
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scans') {
            parallel {
                stage('Trivy: Backend Dependencies') {
                    agent {
                        docker {
                            image 'aquasec/trivy:latest'
                            args '--entrypoint=""'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('backend') {
                            sh 'trivy fs --scanners vuln --severity CRITICAL,HIGH --format json --output trivy-composer-report.json --exit-code 0 .'
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'backend/trivy-composer-report.json', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Trivy: Frontend Dependencies') {
                    agent {
                        docker {
                            image 'aquasec/trivy:latest'
                            args '--entrypoint=""'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh 'trivy fs --scanners vuln --severity CRITICAL,HIGH --format json --output trivy-frontend-report.json --exit-code 0 .'
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'frontend/trivy-frontend-report.json', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t Nexify-backend:latest ./backend & docker build -t Nexify-frontend:latest ./frontend & wait'
            }
        }
        
        stage('Trivy: Scan Images') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint="" -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    trivy image --severity CRITICAL,HIGH --format json --output trivy-backend-image.json --exit-code 0 Nexify-backend:latest &
                    trivy image --severity CRITICAL,HIGH --format json --output trivy-frontend-image.json --exit-code 0 Nexify-frontend:latest &
                    wait
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-*-image.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 911541042693.dkr.ecr.eu-west-3.amazonaws.com
                        
                        COMMIT_SHA=$(git rev-parse --short HEAD)
                        
                        docker tag Nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:$COMMIT_SHA
                        docker tag Nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:latest
                        docker tag Nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:$COMMIT_SHA
                        docker tag Nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:latest
                        
                        docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:$COMMIT_SHA &
                        docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-backend:latest &
                        docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:$COMMIT_SHA &
                        docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/Nexify-frontend:latest &
                        wait
                    '''
                }
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