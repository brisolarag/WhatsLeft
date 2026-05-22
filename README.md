# 🚀 WhatsLeft

Bem-vindo ao repositório do **WhatsLeft**! 

O WhatsLeft é uma aplicação moderna composta por uma API robusta em **.NET 8** e um frontend interativo em **Angular**, projetado para rodar em nuvem utilizando **Oracle Kubernetes Engine (OKE)** e equipado com telemetria e logs centralizados usando a **ELK Stack**.

---

## 🛠️ Stack Tecnológico

### Backend
- **C# / .NET 8.0**
- **Serilog** (Roteamento estruturado de logs)

### Frontend
- **Angular 21**
- **Node.js**

### Infraestrutura & DevOps
- **Docker & Docker Compose** (Ambiente local)
- **Helm** (Gerenciamento de pacotes Kubernetes)
- **Oracle Kubernetes Engine (OKE)** (Cluster de Produção)
- **Elasticsearch & Kibana (ELK Stack)** (Logs e Monitoramento)
- **GitHub Actions** (Pipelines de CI/CD contínuos)
- **Python** (Scripts de validação pós-deploy)

---

## 🏗️ Visão Geral da Arquitetura

1. **WhatsLeft.API**: Um serviço backend .NET 8 rodando de forma independente. Registra logs assincronamente no Elasticsearch.
2. **WhatsLeft.View**: Aplicação Single Page Application (SPA) Angular consumindo a API.
3. **Observabilidade**: O Kibana é utilizado para visualizar de forma rica e pesquisável todos os logs injetados no Elasticsearch.
4. **Pipelines**: Fluxo automatizado via GitHub Actions faz o *Build*, cria as imagens Docker, sobe para o *Oracle Container Registry (OCIR)*, aplica no *OKE* via *Helm* e roda os scripts Python (`infra/validate_*.py`) garantindo que a aplicação está viva após o deploy.

---

## 💻 Como Rodar Localmente (Getting Started)

Para executar o projeto inteiro no seu computador, você precisará do **Docker**, **.NET 8 SDK** e **Node.js (v20+)** instalados.

### 1. Subir Infraestrutura de Logs (ELK)
Abra um terminal na pasta raiz do projeto e inicie os containers do Elasticsearch e Kibana:
```bash
docker-compose up -d
```
*Dica: Pode levar 1-2 minutos para que o Elasticsearch e o Kibana fiquem 100% saudáveis na primeira vez.*

### 2. Rodar a API (.NET)
Navegue até o diretório da API e inicie o servidor backend:
```bash
cd src/WhatsLeft.API
dotnet restore
dotnet run
```

### 3. Rodar o Frontend (Angular)
Em outro terminal, navegue até a pasta do frontend e inicie a interface:
```bash
cd src/WhatsLeft.View/WhatsLeftView
npm ci
npm run start
```

---

## 🌐 Endereços Locais

Após todos os serviços estarem no ar, você poderá acessá-los através das seguintes URLs:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API Swagger** | `https://localhost:<porta>/swagger` | Documentação interativa dos endpoints da API (a porta aparece no console do `dotnet run`) |
| **API Health Check** | `https://localhost:<porta>/health` | Retorna o status de saúde da API (`{"Status":"Healthy"}`) |
| **Frontend (View)** | `http://localhost:4200` | Interface visual do usuário (Angular) |
| **Kibana (Logs)** | `http://localhost:5601` | Dashboard para explorar os logs gerados pela API |
| **Elasticsearch** | `http://localhost:9200` | Motor de busca e logs sob o capô |

---

## 🚀 CI/CD & Deploy

A esteira de integração e entrega (CI/CD) está contida na pasta `.github/workflows`:
- **Build and Test** (`build-and-test.yml`): Compila o frontend, executa os testes unitários (`npm run test`) e também compila o backend (.NET) para garantir integridade a cada Push/PR.
- **Deploy to OKE** (`deploy-oke.yml`): Sempre que o Build termina com sucesso na branch `main`, faz o build das imagens Docker, publica no OCIR e atualiza a infra no Kubernetes via Helm. No final, executa os scripts Python para validar os *Health Checks* do cluster.

**Configuração do Helm (`infra/helm/whatsleft`)**
O pacote Helm gerencia os *Deployments* e *Services* do Kubernetes. E agora puxa automaticamente as imagens do Elasticsearch e Kibana para garantir a infraestrutura necessária de logs em nuvem.

---

*Para dúvidas ou suporte sobre a configuração, consulte as issues do repositório ou os mantenedores do projeto.*
