import mongoose from 'mongoose';

const imovelSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    status: {
        type: String,
        enum: ['cadastrar', 'fazer tour 360º', 'fazer video', 'concluído', 'disponivel'], // <-- ADICIONADO 'disponivel' AQUI
        default: 'cadastrar'
    },

    imagens: [
        {
            nome: String,
            filename: String,
            link: String
        }],

    video: {
        nome: String,
        link: String // <-- Adicionado o campo 'link' para o vídeo também, é necessário para o fix-on-read
    },

    criadoEm: {
        type: Date,
        default: Date.now
    },

    ordem: {
        type: Number,
        default: 0
    }

});

export default mongoose.model('Imovel', imovelSchema);