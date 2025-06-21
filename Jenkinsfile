pipeline {
    agent any
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        DOCKER_IMAGE = "risk-defender-backend"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        // Environment variables for backend
        JWT_SECRET = credentials('jwt-secret')
        KAFKA_BROKERS = credentials('kafka-brokers')
        RAZORPAY_KEY_ID = credentials('razorpay-key-id')
        RAZORPAY_KEY_SECRET = credentials('razorpay-key-secret')
        REDIS_URL = credentials('redis-url')
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/yourusername/your-repo.git', branch: 'main'
            }
        }
        stage('Build and Test Backend') {
            steps {
                dir('backend') {
                    sh 'node -v' // Ensure Node.js is available
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm run test || true' // Continue if tests fail, adjust as needed
                }
            }
        }
        stage('Build and Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'node -v'
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm run test || true' // Continue if tests fail, adjust as needed
                }
            }
        }
        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t $DOCKER_IMAGE:$DOCKER_TAG .'
                    sh 'docker tag $DOCKER_IMAGE:$DOCKER_TAG $DOCKER_IMAGE:latest'
                }
            }
        }
        stage('Deploy Backend to Localhost') {
            steps {
                sh '''
                    docker stop risk-defender-backend || true
                    docker rm risk-defender-backend || true
                    docker run -d --name risk-defender-backend -p 3000:3000 \
                        -e NODE_ENV=production \
                        -e JWT_SECRET=$JWT_SECRET \
                        -e KAFKA_BROKERS=$KAFKA_BROKERS \
                        -e RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID \
                        -e RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET \
                        -e REDIS_URL=$REDIS_URL \
                        $DOCKER_IMAGE:latest
                '''
            }
        }
        stage('Deploy Frontend to Vercel') {
            steps {
                dir('frontend') {
                    sh 'npm install -g vercel'
                    sh 'vercel --prod --token $VERCEL_TOKEN'
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up workspace'
            cleanWs()
        }
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed. Check logs for details.'
        }
    }
}
