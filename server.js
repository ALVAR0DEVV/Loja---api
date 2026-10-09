import express from 'express';

import produtoRoutes from './routes/produto.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';

const app = express();

app.use(express.json());

app.use('/produtos', produtoRoutes);
app.use('/clientes', clienteRoutes);
app.use('/pedidos', pedidoRoutes);


app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
})