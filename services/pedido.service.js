import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cancelarPedidoService(pedidoId) {
  const pedido = await prisma.pedido.findUnique({
    where: {
      id: pedidoId
    },
    include: {
      itens: true
    }
  });

  if (!pedido) {
    throw new Error('PEDIDO_NAO_ENCONTRADO');
  }

  if (pedido.status !== 'Pendente') {
    throw new Error('PEDIDO_NAO_PODE_SER_CANCELADO');
  }

  await prisma.$transaction(async (tx) => {
    for (const item of pedido.itens) {
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
    }

    await tx.pedido.update({
      where: {
        id: pedidoId
      },
      data: {
        status: 'Cancelado'
      }
    });
  });
}