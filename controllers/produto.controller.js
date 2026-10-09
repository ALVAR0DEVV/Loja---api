import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function listarProdutos(req, res) {
  const produtos = await prisma.produto.findMany();

  res.status(200).json(produtos);
}

export async function criarProduto(req, res) {
  const { nome, preco, estoque } = req.body;

  const produto = await prisma.produto.create({
    data: {
      nome,
      preco,
      estoque
    }
  });

  res.status(201).json(produto);
}

export async function buscarProdutoPorId(req, res) {
  const id = Number(req.params.id);

  const produto = await prisma.produto.findUnique({
    where: {
      id: id
    }
  });

  if (!produto) {
    return res.status(404).json({
      mensagem: 'Produto não encontrado'
    });
  }

  res.status(200).json(produto);
}

export async function atualizarProduto(req, res) {
  const id = Number(req.params.id);

  const { nome, preco, estoque } = req.body;

  const produto = await prisma.produto.update({
    where: {
      id: id
    },
    data: {
      nome,
      preco,
      estoque
    }
  });

  res.status(200).json(produto);
}

export async function excluirProduto(req, res) {
  const id = Number(req.params.id);

  const produto = await prisma.produto.findUnique({
    where: {
      id: id
    }
  });

  if (!produto) {
    return res.status(404).json({
      mensagem: 'Produto não encontrado'
    });
  }

  const itemPedido = await prisma.pedidoItem.findFirst({
    where: {
      produtoId: id
    }
  });

  if (itemPedido) {
    return res.status(400).json({
      mensagem: 'Não é possível excluir este produto porque ele está associado a um pedido'
    });
  }

  await prisma.produto.delete({
    where: {
      id: id
    }
  });

  res.status(200).json({
    mensagem: 'Produto excluído com sucesso'
  });
}