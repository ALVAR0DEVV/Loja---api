import { PrismaClient } from '@prisma/client';
import { cancelarPedidoService } from '../services/pedido.service.js';

const prisma = new PrismaClient();

export async function criarPedido(req, res) {
    const { clienteId } = req.body;

    const pedido = await prisma.pedido.create({
        data: {
            clienteId
        }
    });

    res.status(201).json(pedido);
}

export async function listarPedidos(req, res) {
    const pedidos = await prisma.pedido.findMany({
        include: {
            cliente: true,
            itens: {
                include: {
                    produto: true
                }
            }
        }
    });

    res.status(200).json(pedidos);
}

export async function buscarPedidoPorId(req, res) {
    const id = Number(req.params.id);

    const pedido = await prisma.pedido.findUnique({
        where: {
            id: id
        },
        include: {
            cliente: true,
            itens: {
                include: {
                    produto: true
                }
            }
        }
    });

    if (!pedido) {
        return res.status(404).json({
            mensagem: 'Pedido não encontrado'
        });
    }

const itensComSubtotal = pedido.itens.map(item => {
    return {
      ...item,
      subtotal: Number(item.produto.preco) * item.quantidade
    };
  });

  const total = itensComSubtotal.reduce((soma, item) => {
    return soma + item.subtotal;
  }, 0);

  res.status(200).json({
    ...pedido,
    itens: itensComSubtotal,
    total
  });
}

export async function adicionarItemAoPedido(req, res) {
    const pedidoId = Number(req.params.id);

    const { produtoId, quantidade } = req.body;

    const pedido = await prisma.pedido.findUnique({
        where: {
            id: pedidoId
        }
    });

    if (!pedido) {
        return res.status(404).json({
            mensagem: 'Pedido não encontrado'
        });
    }

    const produto = await prisma.produto.findUnique({
        where: {
            id: produtoId
        }
    });

    if (!produto) {
        return res.status(404).json({
            mensagem: 'Produto não encontrado'
        });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({
            mensagem: 'A quantidade deve ser um número inteiro maior que zero'
        });
    }

    if (produto.estoque < quantidade) {
        return res.status(400).json({
            mensagem: 'Estoque insuficiente'
        });
    }

      const itemExistente = await prisma.pedidoItem.findFirst({
    where: {
      pedidoId: pedidoId,
      produtoId: produtoId
    }
  });

  if (itemExistente) {

  const resultado = await prisma.$transaction(async (tx) => {

    const itemAtualizado = await tx.pedidoItem.update({
      where: {
        id: itemExistente.id
      },
      data: {
        quantidade: {
          increment: quantidade
        }
      }
    });

    await tx.produto.update({
      where: {
        id: produtoId
      },
      data: {
        estoque: {
          decrement: quantidade
        }
      }
    });

    return itemAtualizado;
  });

  return res.status(200).json(resultado);
}

    const resultado = await prisma.$transaction(async (tx) => {
        const item = await tx.pedidoItem.create({
            data: {
                pedidoId,
                produtoId,
                quantidade
            }
        });

        await tx.produto.update({
            where: {
                id: produtoId
            },
            data: {
                estoque: {
                    decrement: quantidade
                }
            }
        });

        return item;
    });

    res.status(201).json(resultado);
}

export async function listarItensDoPedido(req, res) {
    const pedidoId = Number(req.params.id);

    const itens = await prisma.pedidoItem.findMany({
        where: {
            pedidoId: pedidoId
        },
        include: {
            produto: true
        }
    });

    const itensComSubtotal = itens.map(item => {
    return {
      ...item,
      subtotal: Number(item.produto.preco) * item.quantidade
    };
  });

  res.status(200).json(itensComSubtotal);
}

export async function atualizarItemDoPedido(req, res) {

    const pedidoId = Number(req.params.pedidoId);

    const itemId = Number(req.params.itemId);

    const { quantidade } = req.body;

    const item = await prisma.pedidoItem.findFirst({
        where: {
            id: itemId,
            pedidoId: pedidoId
        }
    });

    if (!item) {
        return res.status(404).json({
            mensagem: 'Item não encontrado neste pedido'
        });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({
            mensagem: 'A quantidade deve ser um número inteiro maior que zero'
        });
    }

    const produto = await prisma.produto.findUnique({
        where: {
            id: item.produtoId
        }
    });

    const diferenca = quantidade - item.quantidade;

    if (diferenca > 0 && produto.estoque < diferenca) {
        return res.status(400).json({
            mensagem: 'Estoque insuficiente'
        });
    }

    const resultado = await prisma.$transaction(async (tx) => {

        const itemAtualizado = await tx.pedidoItem.update({
            where: {
                id: itemId
            },
            data: {
                quantidade
            }
        });

        if (diferenca > 0) {
            await tx.produto.update({
                where: {
                    id: produto.id
                },
                data: {
                    estoque: {
                        decrement: diferenca
                    }
                }
            });
        }

        if (diferenca < 0) {
            await tx.produto.update({
                where: {
                    id: produto.id
                },
                data: {
                    estoque: {
                        increment: Math.abs(diferenca)
                    }
                }
            });
        }

        return itemAtualizado;
    });

    res.status(200).json(resultado);
}

export async function excluirItemDoPedido(req, res) {

  const pedidoId = Number(req.params.pedidoId);

  const itemId = Number(req.params.itemId);

  const item = await prisma.pedidoItem.findFirst({
    where: {
      id: itemId,
      pedidoId: pedidoId
    }
  });

  if (!item) {
    return res.status(404).json({
      mensagem: 'Item não encontrado neste pedido'
    });
  }

  const resultado = await prisma.$transaction(async (tx) => {

    await tx.produto.update({
      where: {
        id: item.produtoId
      },
      data: {
        estoque: {
          increment: item.quantidade
        }
      }
    });

    await tx.pedidoItem.delete({
      where: {
        id: itemId
      }
    });

    return true;
  });

  res.status(200).json({
    mensagem: 'Item excluído com sucesso'
  });
}

export async function cancelarPedido(req, res) {
  const pedidoId = Number(req.params.id);

  try {
    await cancelarPedidoService(pedidoId);

    res.status(200).json({
      mensagem: 'Pedido cancelado com sucesso'
    });
  } catch (error) {
    if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado'
      });
    }

    if (error.message === 'PEDIDO_NAO_PODE_SER_CANCELADO') {
      return res.status(400).json({
        mensagem: 'Apenas pedidos pendentes podem ser cancelados'
      });
    }

    res.status(500).json({
      mensagem: 'Erro interno do servidor'
    });
  }
}