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
        enum: ['cadastrar', 'fazer tour 360º', 'fazer video', 'concluído'],
        default: 'cadastrar'
    },

    imagens: [
        {
            path: String,
            filename: String
        }],

    video: {
        path: String,
        filename: String
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
