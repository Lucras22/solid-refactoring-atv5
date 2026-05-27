# Atividade: Refatoração com SOLID

Este repositório contém a resolução da atividade de refatoração da classe `Pedido` aplicando os princípios do SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation e Dependency Inversion).

---

## Respostas das Questões

### 1. Responsabilidades da classe `Pedido`
A classe original possui **5 responsabilidades diferentes**:
* **Gerenciamento do pedido:** Manter o estado e calcular o valor bruto (`calcularTotal`). Classe: `Pedido`.
* **Regras de negócio de desconto:** Calcular o valor com desconto (`aplicarDesconto`). Classe: `CalculadoraDesconto`.
* **Persistência de dados:** Salvar as informações no banco de dados (`salvar`). Classe: `PedidoRepository`.
* **Notificação:** Enviar mensagens para o cliente (`notificarCliente`). Classe: `NotificacaoService`.
* **Formatação e Saída (Impressão):** Gerar relatório e enviar para diferentes formatos (`gerarRelatorio`, `imprimir`). Classes: `GeradorRelatorio`, `ImpressoraService`, `PDFService`.

### 2. Razões para mudar
A classe possui **5 razões para mudar** (uma para cada responsabilidade):
1. Se a lógica de cálculo do total do pedido mudar.
2. Se um novo cupom ou regra de desconto for criado/alterado.
3. Se o banco de dados mudar (ex: migrar de MySQL para MongoDB).
4. Se o canal de comunicação com o cliente mudar (ex: mudar de E-mail para SMS).
5. Se uma nova forma de exportação for adicionada (ex: exportar para Excel).

### 3. Nome ideal das novas classes
* `Pedido` (Apenas os dados e cálculo do total)
* `CalculadoraDesconto` (E estratégias como `DescontoVIP`, `DescontoCupom`)
* `PedidoRepository` (Para persistência)
* `NotificationService` (Interface de notificação)
* `GeradorRelatorio` (Para formatação de texto)

### 4. Refatoração do `aplicarDesconto` (OCP)
Implementado no código através do padrão *Strategy*. Criamos classes ou objetos de estratégia para cada tipo de desconto, permitindo adicionar novos descontos apenas criando novas classes, sem tocar na classe de cálculo.

### 5. Cenário: Desconto de aniversário de 15%
* **Antes da refatoração:** Seria necessário modificar 1 linha adicionando mais um `if` dentro da classe `Pedido`, violando o OCP.
* **Depois da refatoração:** Nenhuma linha do código existente é alterada. Apenas cria-se uma nova classe `DescontoAniversario` que implementa a regra.

### 6. Herança ou Composição para Descontos?
O ideal é utilizar **Composição** através do padrão *Strategy*. A classe que calcula o desconto recebe a estratégia de desconto dinamicamente, evitando o acoplamento rígido da herança.

### 7 e 8. `PedidoDigital` vs `PedidoFisico` e o LSP
Se `PedidoDigital` herdar de `Pedido` e o método `calcularFrete()` lançar um erro (ex: `throw new Error("Não tem frete")`), isso **viola o LSP (Princípio da Substituição de Liskov)**. Uma subclasse não deve quebrar o comportamento esperado da classe pai ou lançar exceções inesperadas para métodos que deveriam funcionar. Retornar `0` pode mitigar o erro, mas conceitualmente o frete não deveria existir para produtos digitais.

### 9. Redesenho da hierarquia para o LSP
Para satisfazer o LSP, removemos o frete da classe base. Criamos uma interface ou classe intermediária para pedidos que possuem entrega:
* `Pedido` (Base: id, itens, total)
* `PedidoFisico` estende `Pedido` (Adiciona endereço e método `calcularFrete()`)
* `PedidoDigital` estende `Pedido` (Não possui métodos de frete)

### 10 e 11. Segregação de Interfaces (ISP)
Um serviço que só exporta PDF não deve ser obrigado a implementar métodos de impressora física. Como JavaScript/TypeScript simula interfaces, separamos os contratos:
* Interface/Contrato `Imprimivel`: método `imprimir(conteudo)`
* Interface/Contrato `Exportavel`: método `exportar(conteudo)`

### 12. Injeção de Dependência (DIP)
Em vez de instanciar `new MySQLDatabase()` e `new EmailService()` dentro da classe, passamos as abstrações (ou instâncias prontas) através do construtor das classes de serviço correspondentes.

### 13. Teste unitário para `salvar()` sem Banco de Dados
Criamos um **Mock** ou **Stub** do repositório/banco de dados. Como a classe agora recebe a dependência pelo construtor, passamos um objeto simulado que apenas finge salvar e verifica se a função foi chamada com os parâmetros corretos.

### 14. Mudança de EmailService para SMS
Após a refatoração, apenas criamos uma nova classe `SMSService` que implementa a interface de notificação e passamos ela no construtor. **Zero classes existentes precisam ser modificadas**, cumprindo perfeitamente o DIP e o OCP.