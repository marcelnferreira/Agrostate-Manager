### **Prompt (v3) para Desenvolvimento da Aplicação "Agrostate"**

**Objetivo do Projeto:**

Desenvolver uma aplicação web completa de mediação imobiliária chamada "Agrostate". A plataforma conectará mediadores (corretores) a uma carteira de imóveis, permitirá a gestão de anúncios (incluindo links de redes sociais), o registro e acompanhamento de leads com uma lógica de proteção de carteira, e terá um painel administrativo para gerenciamento da plataforma.

**Stack de Tecnologia:**

*   **Frontend:** React (utilizando hooks e componentes funcionais).
*   **Backend:** Node.js com um framework como Express.js ou NestJS.
*   **Banco de Dados:** PostgreSQL.
*   **Estilização:** Tailwind CSS, seguindo rigorosamente o design dos protótipos fornecidos.
*   **ORM (Recomendado):** Prisma ou TypeORM.

---

### **1. Estrutura do Banco de Dados (Schema PostgreSQL)**

*   **`users`**
    *   `id` (UUID, PK), `full_name`, `email` (Único), `password_hash`, `phone_number`, `nif` (Único), `role` (ENUM: 'MEDIATOR', 'ADMIN'), `status` (ENUM: 'PENDING', 'ACTIVE', 'SUSPENDED'), `created_at`, `updated_at`.

*   **`properties` (Anúncios)**
    *   `id` (UUID, PK), `reference_id` (Único), `title`, `description`, `location`, `area_ha`, `price`, `mediation_type` (ENUM: 'EXCLUSIVE', 'OPEN'), `status` (ENUM: 'ACTIVE', 'SUSPENDED', 'SOLD'), `vertical_image_url`, `horizontal_image_url`, `owner_mediator_id` (UUID, FK para `users.id`), `created_at`, `updated_at`.

*   **`property_social_links` (Links de Redes Sociais) - NOVO**
    *   `id` (UUID, PK)
    *   `property_id` (UUID, FK para `properties.id`)
    *   `platform` (ENUM: 'WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'X', 'YOUTUBE', 'LINKEDIN')
    *   `url` (VARCHAR)
    *   *Constraint*: A combinação de `property_id` e `platform` deve ser única.

*   **`mediator_leads` (Carteira de Leads do Mediador)**
    *   `id` (UUID, PK), `mediator_id` (UUID, FK para `users.id`), `buyer_name`, `buyer_email`, `buyer_phone`, `buyer_nif`, `created_at`, `updated_at`.
    *   *Constraint*: A combinação de `mediator_id` e `buyer_nif` deve ser única.

*   **`property_leads` (Leads Vinculados a Propriedades)**
    *   `id` (UUID, PK), `property_id` (UUID, FK para `properties.id`), `registering_mediator_id` (UUID, FK para `users.id`), `buyer_name`, `buyer_email`, `buyer_phone`, `buyer_nif`, `valid_until` (TIMESTAMP), `pdf_url` (VARCHAR), `created_at`.
    *   *Constraint*: A combinação de `property_id` e `buyer_nif` deve ser única.

---

### **2. Lógica de Negócio Essencial**

#### **2.1. Lógica de Exclusividade e Validação de Leads**

1.  **Carteira Pessoal:** A tela **`carteira de leads`** corresponde à tabela `mediator_leads`. O botão **`adicionar nova lead`** cria um registro nesta tabela.

2.  **Registro em Propriedade:** Ao tentar registrar um lead numa propriedade (tela **`registro de lead`**), a seguinte validação é obrigatória:
    *   **Passo 1:** Identificar o `owner_mediator_id` (Mediador Principal) da propriedade.
    *   **Passo 2:** Se o mediador que está a registrar o lead for diferente do Mediador Principal, o sistema deve verificar se o NIF/email do lead que está sendo registrado **já existe** na tabela `mediator_leads` associado ao `owner_mediator_id`.
    *   **Resultado:**
        *   **Bloqueado:** Se o lead for encontrado, exibir a mensagem: **"Este lead já pertence à carteira do mediador principal do imóvel e não pode ser registado."**
        *   **Permitido:** Caso contrário, criar o registro na tabela `property_leads`.

#### **2.2. Gestão de Links de Redes Sociais para Propriedades**

1.  **Formulário de Anúncio (`criacao de anuncio`, `edição de anuncio`):**
    *   Adicionar uma nova seção no formulário chamada "Redes Sociais".
    *   Esta seção deve permitir que o usuário adicione dinamicamente múltiplos links. A interface deve consistir em:
        *   Um dropdown para selecionar a plataforma (`WEBSITE`, `FACEBOOK`, `INSTAGRAM`, etc.).
        *   Um campo de texto para inserir a URL completa.
        *   Um botão "Adicionar Link" que adiciona o par (plataforma, url) a uma lista visível.
        *   Cada item na lista deve ter um botão "Remover".
    *   Ao submeter o formulário, um array de objetos `{platform, url}` deve ser enviado ao backend.

2.  **Página de Detalhe do Imóvel (`detalhes_imovel`, `pagina de anuncio com detalhes`):**
    *   Se existirem links de redes sociais para a propriedade, exibi-los como uma fileira de ícones clicáveis (ícone do Facebook, Instagram, etc.). Esta seção deve ser visualmente proeminente, preferencialmente abaixo da descrição principal do imóvel.

---

### **3. Personas e Funcionalidades**

(As jornadas do Administrador, Mediador e Visitante permanecem as mesmas descritas na v2, com a adição da funcionalidade de redes sociais na gestão de anúncios.)

---

### **4. Frontend (React Components)**

(A estrutura de componentes permanece a mesma. O design deve ser **pixel-perfect**, replicando os arquivos `*.png` e o `code.html`.)

---

### **5. Backend (API Endpoints - Atualizado)**

*   `/auth/...`, `/admin/...` (sem alterações)

*   **Endpoints de Propriedades (Atualizados):**
    *   `POST /properties`: O corpo da requisição agora pode incluir um array opcional `social_links: [{platform, url}, ...]`. O backend deve criar a propriedade e, em seguida, criar as entradas correspondentes em `property_social_links`.
    *   `PUT /properties/:id`: Similar ao POST, o corpo pode conter o array `social_links`. O backend deve apagar todos os links existentes para aquele `property_id` e inserir a nova lista, para simplificar a lógica de atualização.
    *   `GET /properties/:id`: A resposta deste endpoint deve **incluir** o array `social_links` associado à propriedade.

*   **Endpoints de Leads:** (sem alterações da v2)
    *   `GET /mediator/leads`
    *   `POST /mediator/leads`
    *   `GET /properties/:propertyId/leads`
    *   `POST /properties/:propertyId/leads` (Deve implementar a lógica de validação da seção 2.1)
    *   `GET /property-leads/:leadId/download`
