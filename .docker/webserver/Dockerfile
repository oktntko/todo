FROM amazonlinux:latest

# install amazon-linux-extras install
RUN amazon-linux-extras install -y

# yum update & install
RUN yum update -y && \
    yum groupinstall -y "Development Tools" && \
    yum install -y \
        kernel-devel \
        kernel-headers \
        curl \
        git

# nginx => nodejs => postgres
# (package)nginx
RUN amazon-linux-extras install -y nginx1
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf

# (package)nodejs
RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - && \
    yum install -y --enablerepo=nodesource nodejs && \
    npm i -g npm@latest && \
    npm i -g pm2 && \
    pm2 startup

# (app)frontend
## ビルドして nginx の root に mount

# (app)backend
WORKDIR /usr/local/webapp

COPY ./package*.json ./
RUN npm i -f

COPY ./prisma ./prisma
COPY ./prisma.env ./.env
RUN npm run db:generate

COPY ./dist ./dist
COPY ./ecosystem.config.js ./

# nginx と pm2 のプロセスを同時に起動する https://docs.docker.com/config/containers/multi-service_container/
COPY ./cmd.sh ./
CMD ./cmd.sh
