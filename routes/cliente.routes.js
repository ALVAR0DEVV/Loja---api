import express from 'express';
import {
  listarClientes,
  criarCliente,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente
} from '../controllers/cliente.controller.js';


const router = express.Router();

router.get('/', listarClientes);
router.post('/', criarCliente);
router.get('/:id', buscarClientePorId);
router.put('/:id', atualizarCliente);
router.delete('/:id', deletarCliente);

export default router;