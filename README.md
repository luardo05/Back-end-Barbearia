# Web App da Barbearia - Backend

Este diretório contém o código-fonte do servidor (backend) para o sistema de agendamento e gerenciamento da barbearia. A aplicação é uma API RESTful construída com Node.js e Express.js, projetada para servir o frontend com todos os dados e lógicas de negócio necessários.

## ✨ Arquitetura e Padrões

O projeto segue uma arquitetura em camadas para garantir a separação de responsabilidades, manutenibilidade e testabilidade:

-   **Rotas (`routes`):** Definem os endpoints da API, métodos HTTP e conectam os middlewares e controllers.
-   **Controllers (`controllers`):** Gerenciam as requisições (request) e respostas (response) HTTP. Sua única função é orquestrar o fluxo, chamando os serviços apropriados.
-   **Serviços (`services`):** Contêm toda a lógica de negócio da aplicação (ex: cálculo de preço, verificação de conflito de horários, lógica de estorno). São os únicos que interagem com os modelos.
-   **Modelos (`models`):** Definem os Schemas do Mongoose para o banco de dados MongoDB, representando as entidades da aplicação (`User`, `Appointment`, etc.).
-   **Middlewares (`middleware`):** Funções que interceptam requisições para tarefas como autenticação (JWT), autorização (verificação de `role`), tratamento de uploads (Multer) e paginação.

Este padrão de design é fortemente inspirado no **Princípio da Responsabilidade Única (SRP)** e facilita a manutenção e a adição de novas funcionalidades.

## 🛠️ Tecnologias Utilizadas

-   **Node.js:** Ambiente de execução JavaScript.
-   **Express.js:** Framework para a construção da API RESTful.
-   **MongoDB:** Banco de dados NoSQL para persistência dos dados.
-   **Mongoose:** ODM (Object Data Modeling) para modelar e interagir com o MongoDB.
-   **JSON Web Tokens (JWT):** Para autenticação e gerenciamento de sessões.
-   **Socket.IO:** Para comunicação em tempo real (notificações).
-   **bcrypt.js:** Para hashing seguro de senhas.
-   **Cloudinary:** Para armazenamento e gerenciamento de uploads de imagens na nuvem.
-   **node-cron:** Para agendamento de tarefas automáticas (ex: notificações de aniversário).

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
-   [Node.js](https://nodejs.org/) (versão 18.x ou superior).
-   [MongoDB](https://www.mongodb.com/try/download/community) instalado e rodando localmente, ou uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
-   Uma conta no [Cloudinary](https://cloudinary.com/) para o upload de imagens.

### 2. Instalação
-   Navegue até a pasta `backend/` no seu terminal.
-   Instale as dependências do projeto:
    ```bash
    npm install
    ```

### 3. Configuração do Ambiente
-   Na raiz da pasta `backend/`, crie um arquivo chamado `.env`.
-   Copie e cole o conteúdo abaixo no seu arquivo `.env`, substituindo os valores `seu_..._aqui` pelas suas próprias chaves e configurações:

    ```env
    # Configurações do Servidor
    PORT=3000
    NODE_ENV=development

    # Configurações do Banco de Dados (exemplo para MongoDB local)
    MONGO_URI=mongodb://127.0.0.1:27017/barbeariaDB

    # Segredos para JWT (use um gerador de senhas fortes para isso)
    JWT_SECRET=seu_segredo_super_forte_aqui
    JWT_EXPIRES_IN=90d

    # Credenciais do Cloudinary
    CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
    CLOUDINARY_API_KEY=sua_api_key_aqui
    CLOUDINARY_API_SECRET=seu_api_secret_aqui

    # Configuração do Desconto de Aniversário
    BIRTHDAY_DISCOUNT_ENABLED=true
    BIRTHDAY_DISCOUNT_PERCENTAGE=10
    ```

### 4. Executando o Servidor
-   Para iniciar o servidor em modo de desenvolvimento (com reinicialização automática a cada alteração), use:
    ```bash
    npm run dev
    ```
-   Para iniciar em modo de produção, use:
    ```bash
    npm start
    ```
-   Se tudo estiver correto, você verá as mensagens no console indicando que o servidor está rodando e conectado ao MongoDB.

## 📦 API Endpoints

A API segue o prefixo `/api/v1`. Abaixo estão os principais grupos de rotas:

-   **`POST /auth/register`**: Registra um novo usuário.
-   **`POST /auth/login`**: Autentica um usuário e retorna um token JWT.
-   **`GET /auth/me`**: Retorna os dados do usuário logado.

-   **`GET /users`**: (Admin) Lista todos os usuários (suporta paginação).
-   **`PATCH /users/:id`**: (Logado/Dono) Atualiza um usuário.
-   **`PATCH /users/updateMyPhoto`**: (Logado) Atualiza a foto de perfil do usuário logado.

-   **`GET /services`**: Lista todos os serviços.
-   **`GET /services/:id/price`**: (Logado) Retorna o preço detalhado (com descontos) de um serviço para uma data.
-   **`POST /services`**: (Admin) Cria um novo serviço.

-   **`GET /appointments`**: (Admin) Lista todos os agendamentos (suporta paginação).
-   **`GET /appointments/my-appointments`**: (Logado) Lista os agendamentos do usuário logado.
-   **`POST /appointments`**: (Logado) Cria um novo agendamento.
-   **`PATCH /appointments/:id/status`**: (Admin) Atualiza o status de um agendamento.

-   **`GET /availability/month`**: Retorna a disponibilidade configurada para um mês.
-   **`GET /availability/slots`**: Retorna os horários vagos para um dia específico.
-   **`POST /availability`**: (Admin) Define a disponibilidade (dias/horários) de um dia.

-   **`GET /dashboard/summary`**: (Admin) Retorna os dados agregados para o dashboard (suporta filtro por data).

*(Para uma lista completa de endpoints, consulte os arquivos na pasta `src/api/routes/`)*.
