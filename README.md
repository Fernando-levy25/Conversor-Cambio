# Conversor e Histórico de Câmbio

Aplicação web para **converter valores entre moedas**, **consultar o histórico de cotações** de um par e **monitorar pares** com uma cotação-alvo. Trabalho da disciplina **Programação Web** (UESPI) — 2ª Avaliação, Problema 09.

> **Status:** em desenvolvimento. As seções marcadas com 🚧 serão concluídas ao longo do projeto.

## Integrantes

- **Fernando Levy**
- **Arthur Gabriel**
## Andamento

| Parte | Situação |
|---|---|
| Ambiente (Next.js, TypeScript, SQLite, `.gitignore`) | ✅ pronto |
| Tipos compartilhados (`types/`) e regras de período (`lib/dates.ts`) | ✅ pronto |
| Frontend: layout, navegação, componentes base, formatação e validação de formulários | ✅ pronto |
| Frontend: componentes de seleção, estatísticas, tabela e seletor de período | ✅ pronto |
| Frontend: cliente da API, formulários e páginas | 🚧 em andamento |
| Backend: integração com a API de câmbio e endpoints de consulta | 🚧 em andamento |
| Backend: banco SQLite, registros iniciais e CRUD de pares monitorados | 🚧 em andamento |
| Revisão final, acessibilidade e README completo | ⏳ pendente |

## Funcionalidades

- **Conversor de moedas:** converte um valor entre duas moedas com a cotação mais recente. 🚧
- **Histórico de cotações:** escolhe um período e mostra a tabela de cotações do par, com **mínima, máxima, média e variação percentual**. 🚧
- **Pares monitorados:** cadastra pares com uma cotação-alvo e uma observação opcional, edita e remove, e indica se a **meta foi atingida**. 🚧
- Interface em português, responsiva e acessível (rótulos nos formulários, foco visível, mensagens de erro anunciadas, indicador de meta que não depende só de cor).
- Estados de **carregamento, vazio, erro e entrada inválida** em todas as telas.

## API externa

**Frankfurter v2** — `https://api.frankfurter.dev/v2` (documentação: <https://frankfurter.dev>).

- Gratuita, **sem chave de API** e sem cabeçalho de identificação obrigatório.
- Rotas usadas pelo backend: `GET /currencies`, `GET /rate/{base}/{quote}` e `GET /rates?base=&quotes=&from=&to=`.
- A série histórica contém apenas **dias úteis**.
- O frontend **nunca** acessa a API externa: só o backend a consulta, e converte as respostas para um formato próprio.

## Endpoints do backend 🚧

Implementados como Route Handlers em `app/api/`. Erros sempre no formato `{ "error": "mensagem em português" }`.

| Método | Rota | Finalidade | Parâmetros / corpo | Status |
|---|---|---|---|---|
| GET | `/api/currencies` | Lista as moedas disponíveis | — | 200, 502, 500 |
| GET | `/api/convert` | Converte um valor entre duas moedas | `from`, `to`, `amount` (consulta) | 200, 400, 502, 500 |
| GET | `/api/rates/[base]/[quote]` | Histórico de cotações e estatísticas do par | `start`, `end` (consulta, `AAAA-MM-DD`; padrão: últimos 30 dias) | 200, 400, 502, 500 |
| GET | `/api/watched-pairs` | Lista os pares monitorados com a cotação atual e se a meta foi atingida | — | 200, 502, 500 |
| POST | `/api/watched-pairs` | Inclui um par monitorado | JSON: `base`, `quote`, `target_rate`, `note` (opcional) | 201, 400, 409, 502, 500 |
| PATCH | `/api/watched-pairs/[id]` | Atualiza `target_rate` e/ou `note` | JSON: `target_rate?`, `note?` | 200, 400, 404, 500 |
| DELETE | `/api/watched-pairs/[id]` | Remove um par monitorado | — | 204, 400, 404, 500 |

Significado dos status: `200` consulta ok · `201` criado · `204` removido · `400` parâmetro ausente ou inválido · `404` não encontrado · `409` par já monitorado · `502` falha na API externa · `500` erro interno.

## Banco de dados 🚧

SQLite, acessado com `better-sqlite3`. O arquivo é `data/app.db`, **criado automaticamente** na primeira execução (não é versionado). O modo WAL não é utilizado, e todo SQL é parametrizado. O banco guarda **apenas dados do usuário**; as cotações vêm sempre da API.

### Tabela `watched_pairs`

| Campo | Tipo | Restrições | Editável |
|---|---|---|---|
| `id` | INTEGER | chave primária, autoincremento | não |
| `base` | TEXT | obrigatório, código da moeda de origem | não |
| `quote` | TEXT | obrigatório, código da moeda de destino | não |
| `target_rate` | REAL | obrigatório, maior que zero | sim |
| `note` | TEXT | opcional, até 500 caracteres | sim |
| `created_at` | TEXT | preenchido pelo banco na inclusão | não |

A dupla (`base`, `quote`) é única: repetir um par retorna `409`.

### Registros iniciais (previstos)

Inseridos automaticamente **somente quando o banco é criado**, definidos em um único lugar (`lib/db.ts`):

| Par | Cotação-alvo | Observação |
|---|---|---|
| USD/BRL | 5,2 | Viagem aos Estados Unidos em janeiro. |
| EUR/BRL | 6,5 | — |
| GBP/BRL | 7,0 | Pagamento do curso de inglês em Londres. |
| EUR/USD | 1,1 | — |
| USD/JPY | 165 | Comprar ienes para a viagem ao Japão. |
| GBP/USD | 1,4 | — |
| CHF/EUR | 1,05 | Acompanhar o franco suíço. |

Para **restaurar o banco ao estado inicial**, apague `data/app.db` e reinicie a aplicação.

## Regras de negócio

- **Meta atingida:** `cotação atual >= cotação-alvo`.
- **Variação percentual:** `(última − primeira) / primeira × 100`, usando a primeira e a última cotação retornadas (a API só tem dias úteis).
- **Período do histórico:** data inicial **anterior** à final, sem datas futuras, datas reais no formato `AAAA-MM-DD` e no máximo **366 dias**.
- **Moedas:** código de 3 letras, existente na API, com origem diferente do destino.
- **Observação:** até 500 caracteres. **Cotação-alvo:** número maior que zero.
- **PATCH:** aceita somente `target_rate` e `note`; qualquer outro campo ou valor inválido retorna `400`.

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) e [React](https://react.dev/)
- TypeScript (`strict`)
- Tailwind CSS
- SQLite com [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- API [Frankfurter](https://frankfurter.dev) v2, consumida com `fetch`

## Estrutura do projeto

```
app/
  api/                 Route Handlers (backend)
  page.tsx             Conversor
  rates/[base]/[quote]/page.tsx   Histórico do par
  watched-pairs/page.tsx          Pares monitorados
components/            Componentes reutilizáveis da interface
lib/                   Lógica de apoio (API externa, validação, banco, cliente da API)
types/                 Tipos compartilhados
data/                  Banco SQLite (gerado automaticamente)
```

## Como executar

**Requisitos:** Node.js 22 ou superior (versão usada no desenvolvimento: _confirmar_) e npm.

```bash
git clone https://github.com/Fernando-levy25/Conversor-Cambio.git
cd Conversor-Cambio
npm install
npm run dev
```

Abra <http://localhost:3000>. O banco e os registros iniciais são criados na primeira execução, sem nenhuma configuração adicional.