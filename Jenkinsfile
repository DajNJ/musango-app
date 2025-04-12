pipeline {
  agent any

  environment {
    MONGO_URI = "mongodb://localhost:27017/musango-express"
    DOCKER_IMAGE = "hilltopconsultancy/musango"
    DOCKER_CREDENTIALS_ID = "dockerhub-creds" // Jenkins credentials ID
  }

  stages {
    stage('Clone Repo') {
      steps {
        git url: 'https://github.com/HILL-TOPCONSULTANCY/musango-app.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run Tests') {
      steps {
        // Ensure MongoDB is running locally (assumes it's installed on Jenkins host or as a service)
        sh '''
          echo "Waiting for MongoDB to be ready..."
          until nc -z localhost 27017; do sleep 2; done
        '''
        sh 'npm test'
      }
    }

    stage('Run App Locally') {
      steps {
        sh '''
          nohup node app.js &
          sleep 10
          curl --fail http://localhost:8080/health
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE .'
      }
    }

    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
          sh '''
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            docker push $DOCKER_IMAGE
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Cleaning up...'
      sh 'pkill -f "node app.js" || true'
      sh 'docker logout || true'
    }
  }
}
