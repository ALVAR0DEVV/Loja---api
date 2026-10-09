import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listarClientes(req, res) {
    const clientes = await prisma.cliente.findMany();
    
    res.status(200).json(clientes);
}

export async function criarCliente(req, res) {
  const { nome, email, idade, cidade } = req.body;

  const cliente = await prisma.cliente.create({
    data: {
      nome,
      email,
      idade,
      cidade
    }
  });

  res.status(201).json(cliente);
}

export async function buscarClientePorId(req, res) {
    const id = Number(req.params.id);

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: id
        }
    });


    if (!cliente) {
        return res.status(404).json({
            mensagem: 'Cliente não encontrado'
        })
    }

    res.status(200).json(cliente);
}

export async function atualizarCliente(req,res) {
    const id = Number(req.params.id);

    const {nome, email, idade, cidade} = req.body;

    const cliente = await prisma.cliente.update({

        where: {
            id: id
        }, 
        data: {
            nome,
            email,
            idade,
            cidade
        }
    });
    res.status(200).json(cliente);
}

export async function deletarCliente(req, res) {
  const id = Number(req.params.id);

  const cliente = await prisma.cliente.findUnique({
    where: {
      id: id
    }
  });

  if (!cliente) {
    return res.status(404).json({
      mensagem: 'Cliente não encontrado'
    });
  }

  const pedido = await prisma.pedido.findFirst({
    where: {
      clienteId: id
    }
  });

  if (pedido) {
    return res.status(400).json({
      mensagem: 'Não é possível excluir este cliente porque ele possui pedidos'
    });
  }

  await prisma.cliente.delete({
    where: {
      id: id
    }
  });

  res.status(200).json({
    mensagem: 'Cliente excluído com sucesso'
  });
}