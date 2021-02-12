#!bin/bash

# 1 Criar as politicas de segurança(quem pode acessar, o que ela pode acessar,...)
# 2 Criar as roles de segurança

aws iam create-role \
    --role-name lamda-example \
    --assume-role-policy-document file://policies.json \
    | tee logs/role.json

# 3 criar o arquivo e zipar
zip function.zip index.js

aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handle index.handler \
    --runtime nodejs12.x \
    --role arn:aws:iam::335253377736:role/lamda-example \
    | tee logs/create_function.json

# 4 invocar a function
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.json

#5 atualizar lembre de zipar novamente
aws lambda update-function-code \
    --zip-file fileb://function.zip \
    --function-name hello-cli \
    --publish \
    | tee logs/update-function.json
#6 remover function
aws lambda delete-function \
    --function-name hello-cli

aws iam delete-role \
    --role-name lamda-example