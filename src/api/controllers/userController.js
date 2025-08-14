const User = require('..models/user');

//Criar novo usuário
exports.createUser = async (req, res) => {
    let newUser = null; // Variável para guardar o usuário criado
    const performingUserId = req.userId; // Usuário que está criando (geralmente admin)

    try {
        const { name, email, senha, dataNascimento, numeroTelefone, fotoUrl } = req.body;

        if (!name || !email || !senha || !dataNascimento || !numeroTelefone || !fotoUrl) {
            return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { numeroTelefone }] });
        if (existingUser) {
            return res.status(400).json({ error: "E-mail ou numero de telefone já cadastrado." });
        }

        const user = new User({
            name, email, senha, dataNascimento, numeroTelefone, role, fotoUrl,
            role: req.body.role || 'cliente'
        });

        newUser = await user.save();

        res.status(201).json({
            message: "Usuário criado com sucesso!",
            user: { /* ... dados do usuário ... */ }
        });

        // Quem criou (performingUserId), qual ação, qual modelo, qual ID foi criado
        saveAuditLog(performingUserId, 'CREATE_USER', 'User', newUser._id, { createdUserEmail: newUser.email });

        console.log(`Usuário criado: ${newUser.name} por Usuário ID: ${performingUserId}`);

    } catch (err) {
        console.error('Erro ao criar usuário:', err.message);
        // --- LOG de Falha ---
        saveAuditLog(performingUserId, 'CREATE_USER_FAILED', 'User', newUser?._id || req.body.email || 'unknown', { error: err.message, input: req.body });
        res.status(400).json({ /* ... resposta de erro ... */ });
    }
};

