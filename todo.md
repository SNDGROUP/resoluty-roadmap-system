# Resoluty Roadmap System - TODO

## Fase 1: Estrutura do Banco de Dados e Backend

- [x] Criar schema Drizzle para tarefas (tasks) com campos: id, título, descrição, pilar, responsável, dataInício, dataMeta, status, prioridade, percentualConclusão, criadoEm, atualizadoEm
- [x] Criar schema Drizzle para fases (phases) com campos: id, título, pilar, dataInício, dataMeta, cor
- [x] Gerar e aplicar migrações SQL via webdev_execute_sql
- [x] Implementar query helpers em server/db.ts para CRUD de tarefas e fases
- [x] Criar procedures tRPC para listar, criar, atualizar e deletar tarefas
- [x] Criar procedures tRPC para listar, criar, atualizar e deletar fases
- [x] Implementar filtros tRPC por status, prioridade e pilar (backend com inArray)
- [x] Pré-popular banco de dados com tarefas extraídas do mapa mental

## Fase 2: Interface de Timeline Interativa

- [x] Criar componente Timeline com suporte a visualização por semanas, meses e trimestres
- [x] Implementar faixas organizadas por pilar estratégico (5 pilares)
- [x] Adicionar barras de progresso arrastáveis para ajuste de datas (estrutura pronta)
- [x] Implementar drag-and-drop para alterar datas de início e fim (estrutura pronta)
- [x] Adicionar indicadores visuais de status (cores por status)
- [x] Implementar zoom e scroll horizontal na timeline
- [x] Adicionar legenda de cores e pilares

## Fase 3: Painel de Controle de Tarefas

- [x] Criar componente de tabela de tarefas com colunas: título, pilar, responsável, dataInício, dataMeta, status, prioridade, progresso
- [x] Implementar filtros por status (A Fazer, Em Andamento, Concluído, Atrasado) - integrado com backend
- [x] Implementar filtros por prioridade (Baixa, Média, Alta, Crítica) - integrado com backend
- [x] Implementar filtros por pilar estratégico - integrado com backend
- [x] Adicionar busca por título de tarefa
- [ ] Implementar ordenação por coluna
- [x] Adicionar ações: editar, deletar, duplicar tarefa
- [ ] Implementar seleção múltipla de tarefas

## Fase 4: Formulário de Criação e Edição de Tarefas

- [x] Criar modal/drawer de criação de tarefa com campos: título, descrição, pilar, responsável, dataInício, dataMeta, status, prioridade, percentualConclusão
- [x] Implementar validação de formulário
- [x] Adicionar seletor de pilar com 5 opções
- [ ] Adicionar seletor de responsável (lista de usuários)
- [x] Adicionar seletores de data com calendário
- [x] Adicionar seletor de status com 4 opções
- [x] Adicionar seletor de prioridade com 4 opções
- [x] Adicionar slider para percentual de conclusão
- [x] Implementar salvar e cancelar
- [ ] Reutilizar formulário para edição de tarefa existente

## Fase 5: Barra de Ferramentas de Edição e Diagramação

- [x] Criar barra de ferramentas com ícones: Selecionar, Mão (Pan), Texto, Formas, Diagramação, Ícones, Imagens, Mapas Mentais, Tabelas, Áreas
- [x] Implementar modo Selecionar (padrão)
- [x] Implementar modo Mão para pan na timeline
- [ ] Implementar modo Texto para adicionar anotações
- [ ] Implementar modo Formas para desenhar formas (retângulos, círculos, linhas)
- [ ] Implementar modo Diagramação para conectar elementos
- [ ] Implementar inserção de ícones predefinidos
- [ ] Implementar upload e inserção de imagens
- [ ] Implementar inserção de mapas mentais
- [ ] Implementar inserção de tabelas
- [ ] Implementar ferramenta de áreas para destacar regiões

## Fase 6: Dashboard de Visão Geral

- [x] Criar dashboard com indicadores: total de tarefas, em andamento, concluídas, atrasadas
- [x] Adicionar gráfico de progresso por pilar estratégico
- [x] Adicionar gráfico de distribuição de tarefas por status
- [x] Adicionar gráfico de distribuição de tarefas por prioridade
- [x] Adicionar lista de tarefas próximas do vencimento
- [ ] Adicionar lista de tarefas atrasadas

## Fase 7: Autenticação e Autorização

- [x] Verificar integração de OAuth Manus
- [x] Implementar proteção de rotas com autenticação
- [ ] Implementar verificação de permissões por usuário

## Fase 8: Testes e Otimizações

- [x] Escrever testes vitest para procedures tRPC (9 testes passando: list, create, update, delete, filtros, phases)
- [x] Testar filtros e busca (integrado com backend)
- [ ] Testar drag-and-drop na timeline
- [ ] Otimizar performance da timeline com grandes volumes de dados
- [ ] Testar responsividade em diferentes resoluções

## Fase 9: Publicação

- [ ] Criar checkpoint final
- [ ] Publicar aplicação


## Fase 10: Melhorias Solicitadas

- [x] Implementar timeline com tarefas posicionadas corretamente nas datas
- [x] Criar cores específicas para cada pilar estratégico (Google, Redes Sociais, GoHighLevel, Make.com, Ferramentas Complementares)
- [x] Implementar edição de tarefas existentes (clicar na tarefa para editar)
- [x] Implementar modo noite (dark mode) com toggle no header
- [x] Testar timeline com múltiplas tarefas
- [x] Timeline renderizando com grid de datas e legenda de status/pilares
