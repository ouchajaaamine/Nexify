pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    userRemoteConfigs: [[
                        url: scm.userRemoteConfigs[0].url,
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        
        stage('Parallel Analysis & Build') {
            parallel {
                stage('Backend Pipeline') {
                    agent {
                        docker {
                            image 'php:8.2-cli'
                            reuseNode true
                        }
                    }
                    stages {
                        stage('Backend Dependencies') {
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
                        
                        stage('PHPStan & PHPUnit') {
                            steps {
                                dir('backend') {
                                    sh '''
                                        vendor/bin/phpstan analyse -c phpstan.dist.neon --error-format=table --no-progress --memory-limit=512M &
                                        vendor/bin/phpunit --log-junit test-results.xml &
                                        wait
                                    '''
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
                
                stage('Frontend Pipeline') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            reuseNode true
                        }
                    }
                    stages {
                        stage('Frontend Build') {
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
                    }
                }
                
                stage('Security Scans') {
                    agent {
                        docker {
                            image 'aquasec/trivy:latest'
                            args '--entrypoint=""'
                            reuseNode true
                        }
                    }
                    stages {
                        stage('Backend & Frontend Scan') {
                            steps {
                                sh '''
                                    trivy fs --scanners vuln --severity CRITICAL,HIGH --format table --output backend/trivy-composer-report.json --exit-code 0 backend &
                                    trivy fs --scanners vuln --severity CRITICAL,HIGH --format table --output frontend/trivy-frontend-report.json --exit-code 0 frontend &
                                    wait
                                '''
                            }
                            post {
                                always {
                                    archiveArtifacts artifacts: 'backend/trivy-composer-report.json,frontend/trivy-frontend-report.json', allowEmptyArchive: true
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh '''
                        docker build -t nexify-backend:latest ./backend &
                        docker build -t nexify-frontend:latest ./frontend &
                        wait
                    '''
                }
            }
        }
        
        stage('Scan Docker Images') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint="" -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    trivy image --severity CRITICAL,HIGH --format table --output trivy-backend-image.json --exit-code 0 nexify-backend:latest &
                    trivy image --severity CRITICAL,HIGH --format table --output trivy-frontend-image.json --exit-code 0 nexify-frontend:latest &
                    wait
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
                    
                    docker tag nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-backend:$COMMIT_SHA
                    docker tag nexify-backend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-backend:latest
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-backend:$COMMIT_SHA
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-backend:latest
                    
                    docker tag nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-frontend:$COMMIT_SHA
                    docker tag nexify-frontend:latest 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-frontend:latest
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-frontend:$COMMIT_SHA
                    docker push 911541042693.dkr.ecr.eu-west-3.amazonaws.com/nexify-frontend:latest
                '''
            }
        }

        stage('Deploy to EKS') {
            agent {
                docker {
                    image 'amazon/aws-cli:latest'
                    args '-u root:root --entrypoint=""'
                    reuseNode true
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        # Install kubectl
                        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                        chmod +x kubectl
                        mv kubectl /usr/local/bin/
                        
                        # Configure kubectl to use EKS cluster
                        aws eks update-kubeconfig --name nexify --region eu-west-3
                        
                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/00-namespace.yaml
                        kubectl apply -f k8s/01-configmap.yaml
                        kubectl apply -f k8s/02-secrets.yaml
                        kubectl apply -f k8s/03-postgres.yaml
                        kubectl apply -f k8s/04-redis.yaml
                        
                        # Apply deployments
                        kubectl apply -f k8s/05-backend.yaml
                        kubectl apply -f k8s/06-frontend.yaml
                        
                        # Wait for deployments to complete
                        kubectl rollout status deployment/nexify-backend -n nexify --timeout=5m
                        kubectl rollout status deployment/nexify-frontend -n nexify --timeout=5m
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