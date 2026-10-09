import express from 'express';
import {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
  excluirProduto
} from '../controllers/produto.controller.js';

const router = express.Router();

router.get('/', listarProdutos);
router.post('/', criarProduto);
router.get('/:id', buscarProdutoPorId);
router.put('/:id', atualizarProduto);
router.delete('/:id', excluirProduto);  

export default router;