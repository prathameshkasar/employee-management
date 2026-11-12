
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
	DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_TAG = "${BUILD_NUMBER}"
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64'
        PATH = '/usr/lib/jvm/java-21-openjdk-amd64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                sh '''
                    java -version
                    mvn -version
                    mvn -f backend/pom.xml clean package
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build \
                      -t ${DOCKERHUB_USERNAME}/employee-backend:${IMAGE_TAG} \
                      -t ${DOCKERHUB_USERNAME}/employee-backend:latest \
                      ./backend

                    docker build \
                      -t ${DOCKERHUB_USERNAME}/employee-frontend:${IMAGE_TAG} \
                      -t ${DOCKERHUB_USERNAME}/employee-frontend:latest \
                      ./frontend
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKER_PASS" | docker login \
                          -u "$DOCKER_USER" --password-stdin

                        docker push ${DOCKERHUB_USERNAME}/employee-backend:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/employee-backend:latest

                        docker push ${DOCKERHUB_USERNAME}/employee-frontend:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/employee-frontend:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    sudo -n -u ubuntu /usr/local/bin/kubectl set image \
                      deployment/backend \
                      backend=${DOCKERHUB_USERNAME}/employee-backend:${IMAGE_TAG} \
                      -n employee-app

                    sudo -n -u ubuntu /usr/local/bin/kubectl set image \
                      deployment/frontend \
                      frontend=${DOCKERHUB_USERNAME}/employee-frontend:${IMAGE_TAG} \
                      -n employee-app

                    sudo -n -u ubuntu /usr/local/bin/kubectl rollout status \
                      deployment/backend -n employee-app --timeout=180s

                    sudo -n -u ubuntu /usr/local/bin/kubectl rollout status \
                      deployment/frontend -n employee-app --timeout=180s

                    sudo -n -u ubuntu /usr/local/bin/kubectl get pods \
                      -n employee-app
                '''
            }
        }
    }

    post {
        success {
            echo 'Employee Management application deployed successfully!'
        }

        failure {
            echo 'Pipeline failed. Please check the Jenkins console output.'
        }
    }
}
