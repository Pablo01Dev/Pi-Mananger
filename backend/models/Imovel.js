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
        enum: ['disponivel', 'em andamento', 'vendido'],
        default: 'disponivel'
    },

    imagens: [
        {
            path: String,
            filename: String
        }],

    video: {
        link: String,
        status: {
            type: String,
            enum: ['pendente', 'em andamento', 'concluido'],
            default: 'pendente'
        }
    },

    criadoEm: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Imovel', imovelSchema);
