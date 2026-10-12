// Deployed with Jenkins: builds main, uploads frontend/dist/ over FTP and checks that
// the live site serves the new build (frontend/scripts/deploy.mjs). The Jenkins job
// provides the ftp-deploy credentials and the WEBSITE_FTP_* variables.
pipeline {
  agent {
    kubernetes {
      inheritFrom 'node'
      defaultContainer 'node'
    }
  }

  options {
    disableConcurrentBuilds()
    // The node image has no git, so the Checkout stage clones in the jnlp container.
    skipDefaultCheckout()
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        container('jnlp') {
          checkout scm
        }
      }
    }

    stage('Build') {
      steps {
        dir('frontend') {
          // The image has npm but no pnpm; npx runs the release that package.json pins.
          sh '''
            pnpm="$(node -p 'require("./package.json").packageManager.split("+")[0]')"
            npx --yes "$pnpm" install --frozen-lockfile
            npx --yes "$pnpm" test
            npx --yes "$pnpm" run build
          '''
        }
      }
    }

    stage('Deploy') {
      steps {
        dir('frontend') {
          withCredentials([usernamePassword(credentialsId: 'ftp-deploy', usernameVariable: 'FTP_USER', passwordVariable: 'FTP_PASSWORD')]) {
            sh 'FTP_HOST="$WEBSITE_FTP_HOST" FTP_DIR="$WEBSITE_FTP_DIR" SITE_URL=https://jacobsartin.com node scripts/deploy.mjs'
          }
        }
      }
    }
  }
}
