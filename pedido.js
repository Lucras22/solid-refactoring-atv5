// ==========================================
// 1. ENTIDADES E REGRAS DE NEGÓCIO DA ENTIDADE (SRP / LSP)
// ==========================================

class Pedido {
    constructor(id, cliente, itens) {
        this.id = id;
        this.cliente = cliente; // cliente: { nome, email, telefone }
        this.itens = itens;     // itens: [{ preco, quantidade }]
        this.status = 'pendente';
    }

    calcularTotal() {
        return this.itens.reduce(
            (acc, item) => acc + (item.preco * item.quantidade), 0
        );
    }
}

// Aplicação do LSP: PedidoFisico possui regras de frete, PedidoDigital não.
class PedidoFisico extends Pedido {
    constructor(id, cliente, itens, endereco) {
        super(id, cliente, itens);
        this.endereco = endereco;
    }

    calcularFrete() {
        // Lógica de cálculo de frete baseada no endereço
        return 25.00; 
    }
}

class PedidoDigital extends Pedido {
    // Não possui método calcularFrete, evitando violar o LSP
}


// ==========================================
// 2. PADRÃO STRATEGY PARA DESCONTOS (OCP)
// ==========================================

class DescontoVIP {
    calcular(total) { return total * 0.8; }
}

class DescontoCupom10 {
    calcular(total) { return total * 0.9; }
}

// Nova classe adicionada sem alterar as anteriores (Exemplo questão 5)
class DescontoAniversario15 {
    calcular(total) { return total * 0.85; }
}

class DescontoSemDesconto {
    calcular(total) { return total; }
}

class CalculadoraDesconto {
    efetuarDesconto(pedido, estrategiaDesconto) {
        const total = pedido.calcularTotal();
        return estrategiaDesconto.calcular(total);
    }
}


// ==========================================
// 3. PERSISTÊNCIA (SRP / DIP)
// ==========================================

// Injeção de dependência: O repositório recebe a conexão do banco de dados genérica
class PedidoRepository {
    constructor(databaseConnection) {
        this.db = databaseConnection;
    }

    salvar(pedido) {
        this.db.query(`INSERT INTO pedidos VALUES (${pedido.id})`);
    }
}


// ==========================================
// 4. NOTIFICAÇÕES (SRP / DIP)
// ==========================================

// Simulação de Interfaces/Abstrações para Notificação
class EmailService {
    enviar(cliente, mensagem) {
        console.log(`Enviando E-mail para ${cliente.email}: ${mensagem}`);
    }
}

class SMSService {
    enviar(cliente, mensagem) {
        console.log(`Enviando SMS para ${cliente.telefone}: ${mensagem}`);
    }
}

class NotificacaoService {
    constructor(canalNotificacao) {
        this.canal = canalNotificacao; // Pode ser EmailService ou SMSService
    }

    notificarConfirmacao(pedido) {
        this.canal.enviar(
            pedido.cliente, 
            `Pedido ${pedido.id} confirmado!`
        );
    }
}


// ==========================================
// 5. RELATÓRIOS E IMPRESSÃO (SRP / ISP)
// ==========================================

class GeradorRelatorio {
    gerarTexto(pedido) {
        return `Pedido: ${pedido.id} | Total: ${pedido.calcularTotal()}`;
    }
}

// Interfaces segregadas na prática (ISP)
class PrinterService {
    imprimir(conteudo) {
        console.log(`Imprimindo na impressora física: ${conteudo}`);
    }
}

class PDFService {
    exportar(conteudo) {
        console.log(`Gerando e exportando arquivo PDF: ${conteudo}`);
    }
}


// ==========================================
// EXEMPLO DE USO / DEMONSTRAÇÃO DO FLUXO
// ==========================================

// 1. Criação do cenário (Mocking de conexões para demonstração)
const mockDb = { query: (sql) => console.log(`[DB Exec] ${sql}`) };
const sistemaEmail = new EmailService();

// 2. Instanciando os serviços com Injeção de Dependência
const pedidoRepo = new PedidoRepository(mockDb);
const notificacao = new NotificacaoService(sistemaEmail);
const calcDesconto = new CalculadoraDesconto();

// 3. Criando o pedido
const cliente = { nome: "João", email: "joao@email.com", telefone: "1199999999" };
const itens = [{ preco: 100, quantidade: 2 }, { preco: 50, quantidade: 1 }];
const novoPedido = new PedidoFisico(101, cliente, itens, "Rua das Flores, 123");

// 4. Executando operações isoladas (Sem uma classe gigante controlando tudo)
pedidoRepo.salvar(novoPedido);
notificacao.notificarConfirmacao(novoPedido);

const totalComDescontoVip = calcDesconto.efetuarDesconto(novoPedido, new DescontoVIP());
console.log(`Total com desconto VIP: R$ ${totalComDescontoVip}`);

// Impressão respeitando ISP
const relatorio = new GeradorRelatorio().gerarTexto(novoPedido);
const impressora = new PrinterService();
impressora.imprimir(relatorio);