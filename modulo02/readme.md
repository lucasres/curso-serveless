# Descrição

Depois de cria um usuário no IAM e configurar o grupo de acesso. Instale o aws cli no sistema e der um:

```
aws configure
```

E configure de acordo com as keys geradas

# Teste no S3

Crie um bucket no console do AWS. Após criar va no terminal e teste o upload e listagem

```
echo "Hello :)" > teste.txt
aws s3 cp teste.txt s3://bucket_name/teste.txt
aws s3 ls bucket_name
```
