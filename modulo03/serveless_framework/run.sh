#!bin/bash
#instalar o serverless
npm i -g serverless

#checando a versao
sls -v

#sempre o deploy pra verificar que a api ta certo e o ambiente ta certo(verificar o codigo do yaml, permissoes, se ta tudo certo)
sls deploy

#chamar a funcao
sls invoke -f hello

#chamado local
sls invoke local -f hello --log

#logs
sls logs -f hello --tail
