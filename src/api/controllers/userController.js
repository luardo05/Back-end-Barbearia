const User = require("../models/User");

//Criar novo usuário
exports.createUser = async (req, res) => {
  let newUser = null; // Variável para guardar o usuário criado
  const performingUserId = req.userId; // Usuário que está criando (geralmente admin)

  try {
    const { nome, email, senha, dataNascimento } = req.body;

    if (!nome || !email || !senha || !dataNascimento) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "E-mail ou numero de telefone já cadastrado." });
    }

    const user = new User({
      nome,
      email,
      senha,
      dataNascimento,
      //   numeroTelefone,
      //   role,
      //   fotoUrl,
      role: req.body.role || "cliente",
    });

    newUser = await user.save();

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: {
        /* ... dados do usuário ... */
      },
    });
    console.log(`Nome de usuario: ${newUser.nome}/n email: ${newUser.email}`);

    // Quem criou (performingUserId), qual ação, qual modelo, qual ID foi criado
    // saveAuditLog(performingUserId, "CREATE_USER", "User", newUser._id, {
    //   createdUserEmail: newUser.email,
    // });

    console.log(
      `Usuário criado: ${newUser.nome} por Usuário ID: ${performingUserId}`
    );
  } catch (err) {
    console.error("Erro ao criar usuário:", err.message);
    
    // --- LOG de Falha ---
    // saveAuditLog(
    //   performingUserId,
    //   "CREATE_USER_FAILED",
    //   "User",
    //   newUser?._id || req.body.email || "unknown",
    //   { error: err.message, input: req.body }
    // );
    res.status(400).json({
      /* ... resposta de erro ... */
    });
  }
};



// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-senha"); // não retorna senha
    res.status(200).json(users);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err.message);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

// Buscar usuário por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-senha");
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err.message);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
};

// Atualizar usuário
exports.updateUser = async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento, numeroTelefone, role, fotoUrl } = req.body;

    let user = await User.findById(req.params.id).select("+senha");
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (dataNascimento) user.dataNascimento = dataNascimento;
    if (numeroTelefone) user.numeroTelefone = numeroTelefone;
    if (role) user.role = role;
    if (fotoUrl) user.fotoUrl = fotoUrl;

    // Se a senha foi enviada, faz o hash antes de salvar
    if (senha) {
      user.senha = await bcrypt.hash(senha, 12);
    }

    await user.save();

    res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        dataNascimento: user.dataNascimento,
        numeroTelefone: user.numeroTelefone,
        role: user.role,
        fotoUrl: user.fotoUrl,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err.message);
    res.status(400).json({ error: "Erro ao atualizar usuário." });
  }
};

// Deletar usuário
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir usuário:", err.message);
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
};