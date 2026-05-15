pipeline {
    agent any

    environment {
        PROJECT = 'HospitaliaCare'

        GITHUB_REPO_URL = 'https://github.com/mahadkamran3/Hospital_Management_System.git'

        BACKEND_IMAGE = "hospitalia-backend:${env.BUILD_NUMBER}"
        FRONTEND_IMAGE = "hospitalia-frontend:${env.BUILD_NUMBER}"
        SELENIUM_TEST_IMAGE = "hospitalia-selenium-tests:${env.BUILD_NUMBER}"

        MONGO_URI = 'mongodb://mongodb:27017/hospital_appointments'

        DB_PORT = '27017'
        NODE_PORT = '5000'
        FRONTEND_PORT = '80'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        skipDefaultCheckout()
    }

    stages {

        // =========================================
        // STAGE 1 - CHECKOUT
        // =========================================
        stage('Checkout') {
            steps {

                git branch: 'main',
                url: "${GITHUB_REPO_URL}"

                bat 'git rev-parse --short HEAD'
            }
        }

        // =========================================
        // STAGE 2 - INSTALL DEPENDENCIES
        // =========================================
        stage('Install Dependencies') {
            steps {

                bat '''
                    echo ==============================
                    echo Installing Backend Dependencies
                    echo ==============================

                    cd backend
                    npm install

                    cd ..

                    echo ==============================
                    echo Installing Frontend Dependencies
                    echo ==============================

                    cd frontend
                    npm install

                    cd ..

                    echo ==============================
                    echo Installing Test Dependencies
                    echo ==============================

                    cd tests
                    npm install

                    cd ..
                '''
            }
        }

        // =========================================
        // STAGE 3 - BUILD DOCKER IMAGES
        // =========================================
        stage('Build Docker Images') {
            steps {

                bat '''
                    echo ==============================
                    echo Building Docker Images
                    echo ==============================

                    docker build -t %BACKEND_IMAGE% -f backend/Dockerfile backend

                    docker build -t %FRONTEND_IMAGE% -f frontend/Dockerfile frontend

                    docker build -t %SELENIUM_TEST_IMAGE% -f tests/Dockerfile ./tests
                '''
            }
        }

        // =========================================
        // STAGE 4 - UNIT TESTING
        // =========================================
        stage('Unit Testing') {
            steps {

                bat '''
                    echo ==============================
                    echo Starting Test Environment
                    echo ==============================

                    docker compose -f docker-compose.test.yml down -v

                    docker compose -f docker-compose.test.yml up -d
                '''

                bat '''
                    echo ==============================
                    echo Running Jest Tests
                    echo ==============================

                    cd backend

                    npm install

                    npx jest --forceExit --detectOpenHandles --runInBand --coverage

                    cd ..
                '''
            }

            post {
                always {

                    bat '''
                        docker compose -f docker-compose.test.yml down -v
                    '''
                }
            }
        }

        // =========================================
        // STAGE 5 - SELENIUM TESTING
        // =========================================
       stage('Selenium Testing') {
            steps {
                bat '''
                    echo ==============================
                    echo Running Selenium Tests
                    echo ==============================

                    // docker run --rm ^
                    // --shm-size=2g ^
                    // -e FRONTEND_URL=http://host.docker.internal:5173 ^
                    // -e BACKEND_URL=http://host.docker.internal:5000 ^
                    // %SELENIUM_TEST_IMAGE%
                '''
            }
        }

        // =========================================
        // STAGE 6 - DEPLOYMENT
        // =========================================
        stage('Deployment') {
            steps {

                bat '''
                    echo ==============================
                    echo Deploying Application
                    echo ==============================

                    docker compose down

                    docker compose up -d --build

                    docker compose ps
                '''
            }
        }
    }

    // =========================================
    // POST ACTIONS
    // =========================================
    post {

        always {

            bat '''
                echo ==================================
                echo Pipeline Finished
                echo ==================================

                docker container prune -f
            '''

            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }
    }
}