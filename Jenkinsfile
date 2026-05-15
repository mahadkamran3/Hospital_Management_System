pipeline {
    agent any

    tools { nodejs 'NodeJS_20' }

    environment {
        PROJECT                 = 'HospitaliaCare'
        GITHUB_REPO_URL         = 'https://github.com/chumarhassan/HospitaliaCare-Hospital-Appointment-Management-System.git'
        AWS_REGION              = 'us-east-1'
        EC2_USER                = 'ubuntu'
        BACKEND_IMAGE           = "${ECR_REGISTRY:-hospitalia}/hospitalia-backend:${env.BUILD_NUMBER}"
        FRONTEND_IMAGE          = "${ECR_REGISTRY:-hospitalia}/hospitalia-frontend:${env.BUILD_NUMBER}"
        SELENIUM_TEST_IMAGE     = "${ECR_REGISTRY:-hospitalia}/hospitalia-selenium-tests:${env.BUILD_NUMBER}"
        MONGO_URI               = 'mongodb://mongodb:27017/hospital_appointments'
        JWT_SECRET              = credentials('JWT_SECRET_KEY')
        GITHUB_CREDENTIALS      = 'github-credentials'
        DB_PORT                 = '27017'
        NODE_PORT               = '5000'
        FRONTEND_PORT           = '80'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        skipDefaultCheckout()
    }

    stages {

        // ──────────────────────────────────────────────
        // STAGE 1 – Checkout
        // ──────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: "${GITHUB_REPO_URL}", credentialsId: "${GITHUB_CREDENTIALS}"]]
                ])
                sh 'git rev-parse --short HEAD'
                updateGitlabCommitStatus name: 'build', state: 'running'
            }
        }

        // ──────────────────────────────────────────────
        // STAGE 2 – Code Build
        //   • Install Node.js dependencies
        //   • Build Docker images for all three services
        // ──────────────────────────────────────────────
        stage('Code Build') {
            steps {
                script {
                    sh '''
                        echo "=============================="
                        echo "   Installing dependencies     "
                        echo "=============================="
                        cd backend  && npm ci --only=production
                        cd ../frontend && npm ci
                        cd ../tests   && npm ci
                    '''
                }
                script {
                    sh '''
                        echo "=============================="
                        echo "   Building Docker Images      "
                        echo "=============================="
                        docker build -t ${BACKEND_IMAGE}    -f backend/Dockerfile    ./backend
                        docker build -t ${FRONTEND_IMAGE}   -f frontend/Dockerfile  ./frontend
                        docker build -t ${SELENIUM_TEST_IMAGE} -f tests/Dockerfile  .
                    '''
                }
            }
        }

        // ──────────────────────────────────────────────
        // STAGE 3 – Unit Testing
        //   Runs Jest + supertest inside a dedicated
        //   unit-tests service container (mongodb-memory-
        //   server compatible via a temporary MongoDB
        //   container spun up in the pipeline)
        // ──────────────────────────────────────────────
        stage('Unit Testing') {
            steps {
                script {
                    // Remove any stale resource so each run starts fresh
                    sh 'docker compose -f docker-compose.test.yml down -v 2>/dev/null || true'

                    sh '''
                        echo "=============================="
                        echo "   Starting unit-test MongoDB  "
                        echo "=============================="
                        docker compose -f docker-compose.test.yml up -d --wait
                    '''

                    // Install dev dependencies (jest, supertest, mongodb-memory-server) and run all tests
                    sh '''
                        echo "=============================="
                        echo "   Running Jest Unit Tests     "
                        echo "=============================="
                        cd backend
                        npm install --include=dev --no-optional
                        npx jest --forceExit --detectOpenHandles --runInBand --coverage
                    '''

                }
            }
            post {
                always {
                    sh '''docker compose -f docker-compose.test.yml down -v || true'''
                }
                failure {
                    updateGitlabCommitStatus name: 'test', state: 'failed'
                }
                success {
                    updateGitlabCommitStatus name: 'test', state: 'passed'
                }
            }
        }

        // ──────────────────────────────────────────────
        // STAGE 4 – Containerized Selenium Testing
        //   Runs E2E Selenium tests (login, appointment
        //   creation, logout) against the live containers
        //   started in stage 3
        // ──────────────────────────────────────────────
        stage('Containerized Selenium Testing') {
            steps {
                script {
                    sh '''
                        echo "=============================="
                        echo "   Selenium E2E Tests          "
                        echo "=============================="
                        docker run --rm \
                            --network host \
                            -e FRONTEND_URL=http://localhost:5173 \
                            -e BACKEND_URL=http://localhost:5000 \
                            ${SELENIUM_TEST_IMAGE}
                    '''
                }
            }
            post {
                failure {
                    updateGitlabCommitStatus name: 'selenium', state: 'failed'
                }
                success {
                    updateGitlabCommitStatus name: 'selenium', state: 'passed'
                }
            }
        }

        // ──────────────────────────────────────────────
        // STAGE 5 – Containerized Deployment
        //   Stops any running stack and starts fresh
        //   containers for backend + frontend + MongoDB
        // ──────────────────────────────────────────────
        stage('Containerized Deployment') {
            steps {
                script {
                    sh 'docker compose -f docker-compose.yml down --remove-orphans -v 2>/dev/null'
                    sh '''
                        echo "=============================="
                        echo "   Deploying Production Stack  "
                        echo "=============================="
                        docker compose -f docker-compose.yml up -d --build --wait
                        echo "Deployment complete."
                        docker compose -f docker-compose.yml ps
                        docker compose -f docker-compose.yml logs --tail=50
                    '''
                }
            }
            post {
                failure {
                    updateGitlabCommitStatus name: 'deploy', state: 'failed'
                }
                success {
                    updateGitlabCommitStatus name: 'deploy', state: 'passed'
                    // push notification placeholder
                    // slackSend channel: '#deployments', message: "${PROJECT} build #${env.BUILD_NUMBER} deployed successfully"
                }
            }
        }
    }

    post {
        always {
            sh '''
                echo "=== Pipeline finished at $(date) ==="
                # Never leave dangling Selenium containers behind
                docker ps -a --format '{{.Names}}\t{{.Image}}' | grep hospitalia-selenium-tests | awk '{print $1}' | xargs -r docker rm -f
            '''
            cleanWs()
        }
        failure {
            echo "Pipeline failed. Check console output for details."
            // mail to: dev-team@example.com, subject: "${PROJECT} Build #${env.BUILD_NUMBER} FAILED"
        }
    }
}
