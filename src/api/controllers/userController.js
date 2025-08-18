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