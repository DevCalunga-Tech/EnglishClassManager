# 📚 Sistema de Gestão de Turmas de Inglês

Sistema completo para gestão de turmas de inglês, desenvolvido como projecto académico no **ISPOZANGO — Pólo Luanda-Sul**. Inclui uma API RESTful em Node.js e um frontend SPA em JavaScript puro com Tailwind CSS.

---

## 🗂️ Estrutura do Repositório

```
gestao_turmas_completo/
├── gestao_turmas_api/        # Backend — API RESTful (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── config/           # Configuração da base de dados
│   │   ├── controllers/      # Lógica de negócio por domínio
│   │   ├── middlewares/      # Autenticação JWT
│   │   ├── models/           # Modelos de dados (MySQL)
│   │   └── routes/           # Rotas da API
│   ├── server.js             # Ponto de entrada do servidor
│   ├── swagger.js            # Geração da documentação Swagger
│   └── .env                  # Variáveis de ambiente (não incluir no Git)
└── front_completo/           # Frontend — SPA (HTML + Tailwind CSS + JS vanilla)
    ├── index.html            # Página de login
    ├── dashboard.html        # Painel principal
    └── js/
        ├── api.js            # Camada de comunicação com a API
        ├── auth.js           # Autenticação e sessão
        ├── students.js       # Gestão de alunos
        ├── classes.js        # Gestão de turmas
        ├── attendance.js     # Controlo de presenças
        ├── grades.js         # Notas e avaliações
        ├── feedback.js       # Feedback e ficha pedagógica
        └── dashboard.js      # Métricas e resumos
```

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Função |
|---|---|
| Node.js + Express | Servidor e roteamento |
| MySQL 2 | Base de dados relacional |
| JSON Web Token (JWT) | Autenticação stateless |
| bcryptjs | Hash de passwords |
| dotenv | Variáveis de ambiente |
| nodemon | Hot-reload em desenvolvimento |
| swagger-autogen + swagger-ui-express | Documentação automática da API |
| cors | Controlo de origens cruzadas |

### Frontend
| Tecnologia | Função |
|---|---|
| HTML5 + JavaScript Vanilla | Interface sem framework |
| Tailwind CSS (CDN) | Estilização utilitária |
| Fetch API | Comunicação assíncrona com a API |

---

## ⚙️ Como Executar

### Pré-requisitos
- Node.js v18+
- MySQL 5.7+ ou MariaDB
- npm

### 1. Configurar a Base de Dados

Crie a base de dados no MySQL e importe o schema (se disponível):

```sql
CREATE DATABASE gestao_turmas;
```

### 2. Configurar as Variáveis de Ambiente

Dentro de `gestao_turmas_api/`, crie ou edite o ficheiro `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_password
DB_NAME=gestao_turmas
PORT=3000
JWT_SECRET=sua_chave_secreta
```

> ⚠️ **Nunca faça commit do ficheiro `.env`** — adicione-o ao `.gitignore`.

### 3. Instalar Dependências e Iniciar a API

```bash
cd gestao_turmas_api
npm install
npm run dev       # desenvolvimento (nodemon)
# ou
npm start         # produção
```

A API ficará disponível em `http://localhost:3000`.

### 4. Abrir o Frontend

Abra o ficheiro `front_completo/index.html` directamente no browser, ou sirva a pasta com um servidor estático:

```bash
cd front_completo
npx serve .
```

---

## 📡 Endpoints da API

A documentação interactiva completa está disponível em **`/api-docs`** após iniciar o servidor (Swagger UI).

### Resumo dos módulos

| Módulo | Rota base | Descrição |
|---|---|---|
| Autenticação | `/api/auth` | Login e registo de utilizadores |
| Alunos | `/api/students` | CRUD de alunos |
| Turmas | `/api/classes` | Criação e gestão de turmas |
| Matrículas | `/api/enrollments` | Inscrição de alunos em turmas |
| Presenças | `/api/attendance` | Registo de presenças por aula |
| Notas | `/api/grades` | Avaliações e notas dos alunos |
| Feedback | `/api/feedback` | Ficha pedagógica e observações |

Todos os endpoints (excepto login) requerem o header:
```
Authorization: Bearer <token>
```

---

## 🖥️ Funcionalidades do Frontend

- **Login** — autenticação com JWT, persistência de sessão
- **Dashboard** — métricas globais (total de alunos, turmas, presenças)
- **Alunos** — listagem, criação, edição e remoção
- **Turmas** — gestão de turmas e horários
- **Presenças** — registo e visualização por turma/data
- **Notas** — lançamento e consulta de avaliações
- **Ficha Pedagógica** — feedback e observações por aluno

---

## 👥 Equipa

| Nome | Função |
|---|---|
| Calunga | Desenvolvimento fullstack |
---

## 🏫 Contexto Académico

Projecto desenvolvido no âmbito do curso de engenharia no **ISPOZANGO — Pólo Luanda-Sul**, Luanda, Angola.

---

## 📄 Licença

Este projecto é de uso académico. Todos os direitos reservados aos autores.
