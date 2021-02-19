# Descrição 

Trabalhando com layers. Usando binários como dependencias.

# Obs 

* Para poder usar as layers tem que criar uma pasta chamado nodejs

* O projeto do yumba contem alguns binários que são para manipulação de imagens, sons e etc. Uma observação é que devemos zipar a pasta dependencies que é o que o yumba baixa os binários criar um link simbolico pra ela e assim nao teremos problemas de versão uma vez que ambas usam as mesmas dependencias

instalando as dependencias

```
bash install.sh
```

zipando

```
zip -yr ./ ./dependencies 
```