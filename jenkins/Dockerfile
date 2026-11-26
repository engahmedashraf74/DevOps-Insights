FROM docker:29.7.2-cli AS docker-cli

FROM jenkins/jenkins:lts-jdk21

USER root

# Install Docker CLI
COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker

# Install AWS CLI
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip \
    && apt-get purge -y curl unzip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN docker --version && aws --version

USER jenkins