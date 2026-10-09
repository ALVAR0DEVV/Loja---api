import express from 'express';
import {
  criarPedido,
  listarPedidos,
  buscarPedidoPorId,
  adicionarItemAoPedido,
  listarItensDoPedido,
  atualizarItemDoPedido,
  excluirItemDoPedido,
  cancelarPedido
} from '../controllers/pedido.controller.js';

const router = express.Router();

router.post('/', criarPedido);
router.get('/', listarPedidos);
router.get('/:id', buscarPedidoPorId);
router.post('/:id/itens', adicionarItemAoPedido);
router.get('/:id/itens', listarItensDoPedido);
router.put('/:pedidoId/itens/:itemId', atualizarItemDoPedido);
router.delete('/:pedidoId/itens/:itemId', excluirItemDoPedido);
router.patch('/:id/cancelar', cancelarPedido);

export default router;