pipeline {
    agent any
    
    environment {
        // Docker image names (replace with your DockerHub username)
        FRONTEND_IMAGE = 'rahulshende/riskdefender_pro11:frontend'
        BACKEND_IMAGE = 'rahulshende/riskdefender_pro11:backend'
        
        // DockerHub credentials (configure in Jenkins)
        DOCKERHUB_CREDS = credentials('dockerhub-creds') // Username & Password
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm  // Pulls code from SCM (Git)
            }
        }
        
        stage('Build Frontend Docker Image') {
            steps {
                script {
                    docker.build("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}", "-f Dockerfile.frontend .")
                }
            }
        }
        
        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    script {
                        docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}", "-f Dockerfile.backend .")
                    }
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                script {
                    sh "echo ${DOCKERHUB_CREDS_PSW} | docker login -u ${DOCKERHUB_CREDS_USR} --password-stdin"
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                script {
                    // Push versioned images (with build number)
                    sh "docker push ${FRONTEND_IMAGE}:${env.BUILD_NUMBER}"
                    sh "docker push ${BACKEND_IMAGE}:${env.BUILD_NUMBER}"
                    
                    // Tag and push as 'latest'
                    sh "docker tag ${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ${FRONTEND_IMAGE}:latest"
                    sh "docker tag ${BACKEND_IMAGE}:${env.BUILD_NUMBER} ${BACKEND_IMAGE}:latest"
                    
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                sh "docker logout"  // Logout from DockerHub
            }
        }
    }
    
    post {
        always {
            cleanWs()  // Clean workspace after build
        }
    }
}
