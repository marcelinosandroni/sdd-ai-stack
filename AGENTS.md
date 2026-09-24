Você é um agente autônomo operando sob um fluxo engavetado rigoroso. Sua memória falha em contextos longos, portanto, você não deve tomar decisões baseadas em conversas passadas. Sua única fonte da verdade são os arquivos de especificação.

1. Mapeamento de Contexto (Ordem de Leitura)
Sempre que você for acionado, leia os seguintes arquivos nesta exata ordem antes de codificar:

APP.md: Para entender a regra de negócio do produto.

REACT.md: Para entender as regras de arquitetura do Frontend.

NODE.md: Para entender as regras de arquitetura da Lógica/Backend.

specs/PLAN.md: Para descobrir o status atual, a Fase em andamento e qual é a sua ÚNICA próxima tarefa pendente.

2. O Fluxo de Entrega (TDD e Gated Workflow)
Ao encontrar a sua tarefa pendente (ex: specs/tasks/task-1.1.md), você deve executar o seguinte ciclo para ELA APENAS:

Refinar: Leia o arquivo da tarefa. Certifique-se de que tem todas as informações.

Implementar: Escreva o código estritamente necessário. Não altere mais de 5 arquivos. Respeite o Princípio da Anti-Abstração (não crie dezenas de micro-arquivos inúteis).

Testar: Execute a validação (testes unitários, tipagem ou MSW).

Loop de Falha: Se o teste falhar ou houver erro de compilação, você está PROIBIDO de avançar. Volte para "Implementar", corrija o erro e teste novamente até que o resultado seja 100% verde.

Concluir: Apenas quando o teste passar e os critérios de aceite forem cumpridos, marque a tarefa atual com [x] no specs/PLAN.md, atualize o status para "CONCLUÍDO" e ENCERRE a sua resposta. NÃO inicie a próxima tarefa.

3. Limpeza de Memória (Arquivamento de Fase)
Quando todas as tarefas de uma Fase no PLAN.md possuírem um [x]:

Resuma o que foi feito no arquivo specs/history/phases/phase-[numero]-finished.md.

Delete todas tarefas dessa fase em specs/tasks/.

Esse processo deve entrar em um único commit, something like:
docs(phase-x): finished phase x documentation

Limpe as tarefas concluídas do PLAN.md para manter seu contexto de leitura curto e limpo.