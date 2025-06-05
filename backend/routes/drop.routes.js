// Em um arquivo de rotas temporário, ou no server.js
import express from 'express';
import { Dropbox } from 'dropbox';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const APP_KEY = process.env.DROPBOX_APP_KEY; // Sua App Key (Client ID)
const APP_SECRET = process.env.DROPBOX_APP_SECRET; // Sua App Secret (Client Secret)
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI; // A URI que você cadastrou

// Exemplo de rota para iniciar a autorização
router.get('/auth/dropbox', (req, res) => {
    const dbx = new Dropbox({ clientId: APP_KEY });
    const authUrl = dbx.getAuthenticationUrl(
        REDIRECT_URI,
        null, // State (opcional)
        'code', // response_type
        'app_folder', // access_type - ou 'full' se for o caso
        null, // disable_signup
        false, // force_reauthentication
        true // token_access_type=offline - ESTE É O CRUCIAL!
    );
    res.redirect(authUrl);
});

// Exemplo de rota de callback para capturar o código e obter tokens
router.get('/auth/dropbox/callback', async (req, res) => {
    const { code } = req.query; // O Dropbox retorna o código aqui

    if (!code) {
        return res.status(400).send('Código de autorização não encontrado.');
    }

    try {
        const dbx = new Dropbox({ clientId: APP_KEY, clientSecret: APP_SECRET });
        const tokenResult = await dbx.getAccessTokenFromCode(REDIRECT_URI, code);

        const { access_token, refresh_token, expires_in } = tokenResult.result;

        console.log('NOVO ACCESS TOKEN:', access_token);
        console.log('NOVO REFRESH TOKEN:', refresh_token);
        console.log('ACCESS TOKEN EXPIRA EM (segundos):', expires_in);

        // TODO: Salve o refresh_token com segurança (ex: no seu .env como DROPBOX_REFRESH_TOKEN)
        // Para testar, você pode copiar e colar manualmente no .env.
        // Para produção, você salvaria em um DB ou serviço de segredos.

        res.send(`
            <h1>Tokens obtidos!</h1>
            <p>O Access Token foi logado no console do servidor.</p>
            <p>O Refresh Token também foi logado. POR FAVOR, SALVE-O NO SEU ARQUIVO .env como DROPBOX_REFRESH_TOKEN</p>
            <p>Você pode fechar esta página.</p>
        `);
    } catch (error) {
        console.error('Erro ao obter tokens:', error);
        res.status(500).send('Erro ao obter tokens do Dropbox.');
    }
});

export default router; // Adicione este router no seu server.js