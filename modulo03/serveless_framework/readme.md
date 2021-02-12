# Descrição

No service yml voce pode definir varias configurações como roles, runtime e etc

# Events

Quais eventos vão disparar minha function. Por exemplo um http

```
...
events:
    - httpApi: #tipo do evento
        path: /users/create #endpoint
        method: get #metodo da request 
...
```

Comandos usado no run.sh