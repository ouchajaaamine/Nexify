FROM jenkins/jenkins:lts

USER root

# Install Docker CLI 
RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends docker-cli git curl unzip \
    && rm -rf /var/lib/apt/lists/*

# essential Jenkins plugins
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt


USER jenkins
