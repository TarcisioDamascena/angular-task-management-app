# Task Management App

Este repositório contém o frontend desenvolvido com Angular 19+ e Angular Material para uma aplicação full stack.

## Tecnologias Utilizadas

- Angular 19+
- Angular Material
- TypeScript
- RxJS
- Angular CLI

## Como Executar o Projeto

### Requisitos
- Node.js instalado (recomendado: 18+)
- Angular CLI (opcional, mas recomendado)

### Passos para Executar
1. Clone o repositório:
   ```bash
   git clone https://github.com/TarcisioDamascena/angular-task-management-app.git
   cd angular-task-management-app
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   ng serve
   ```

4. O frontend estará disponível em:
   ```
   http://localhost:4200
   ```

## Scripts úteis

```bash
npm run start    # roda o dev server (ng serve)
npm run build    # build de produção
npm run test     # executa testes unitários
npm run serve:ssr:angular-task-management-app # roda SSR (após build)
```

## Estrutura do projeto

```
src/
  app/
    components/    # componentes de UI (login, register, task-list, etc.)
    guards/        # proteção de rotas (AuthGuard)
    models/        # interfaces/modelos de domínio
    services/      # integração com API e auth
```

## Conexão com a API
Este frontend consome a API desenvolvida em Java Spring, que pode ser encontrada no seguinte repositório:
[Link para o repositório do backend](https://github.com/TarcisioDamascena/task-management)

### Configuração da API
Atualmente, os serviços utilizam URLs fixas para a API. Se quiser alterar o endereço, ajuste os valores nos arquivos:
- `src/app/services/auth.service.ts`
- `src/app/services/task.service.ts`

> Sugestão: centralizar o `apiUrl` em um arquivo de environment para facilitar a troca entre ambientes.

## SSR (Server-Side Rendering)

Para gerar o build com SSR e executar o servidor:

```bash
npm run build
npm run serve:ssr:angular-task-management-app
```

O servidor SSR ficará disponível em:
```
http://localhost:4000
```

## Testes

```bash
npm run test
```

## Demonstração 
### Login/Registro
![Login-gif](https://github.com/user-attachments/assets/20cfc09b-8b24-4337-94c9-b54a23ecbde7)

### Criação, Alteração e Remoção 
![CreateUpdateDelete](https://github.com/user-attachments/assets/436d7e01-eff9-44b1-91bd-a4330707fd1d)

### Etiquetas de Alerta
![TaskLabelAndSorting](https://github.com/user-attachments/assets/0a3e3b49-7a68-4eab-aa42-8688df4938ed)
