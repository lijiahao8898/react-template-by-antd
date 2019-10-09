pipeline {
  agent any
  stages {
    stage('build') {
      agent {
        docker {
          image 'harbor.showcode.info/library/auto_ci:latest'
          args '-v /root:/root -u root'
        }
        
      }
      steps {
        sh '''project=plms-webapp-prd
python3 /sendmsg.py -p $project -c 1
npm install --sass-binary-site=https://npm.taobao.org/mirrors/node-sass/ --registry=https://nexus.jycdev.cn/repository/node-group/
npm run build
'''
      }
    }
    stage('deploy') {
      agent {
        docker {
          image 'harbor.showcode.info/library/auto_ci:latest'
          args '-v /root:/root -u root'
        }
      }
      steps {
        sh '''#!/bin/bash
project=Plms-Webapp-Prd
sed -i \'s/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g\' /etc/apk/repositories
apk update
apk add openssh
ls -alh
rm .git* -rf
targetServer="10.100.3.151 10.100.3.152"
targetDir="/usr/share/nginx/html/plms"
newDir="/usr/share/nginx/html/plmsnew"
backDir="/usr/share/nginx/html/plmsold"
function deploy(){
    echo "start deploy on $i"
    scp -r ./build $i:$newDir
    ssh -t -t $i << EOF
mv $targetDir $backDir
mv $newDir $targetDir
chown nginx:nginx $targetDir -R
sleep 5s
rm -rf $backDir
exit
EOF
}
function startDeploy(){
    python3 /sendmsg.py -p $project -c 2
    for i in $targetServer
    do  
        deploy
    done
    python3 /sendmsg.py -p $project -c 0
}
startDeploy
'''
      }
    }
  }
}
