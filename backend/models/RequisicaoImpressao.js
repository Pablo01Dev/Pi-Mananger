import mongoose from 'mongoose';

const RequisicaoImpressaoSchema = new mongoose.Schema({
  solicitante: { type: String, required: true },
  descricao: { type: String, required: true },
  tipoMaterial: { type: String, required: true }, // ex: banner, cartão, folder
  dataSolicitacao: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pendente', 'em produção', 'finalizado'],
    default: 'pendente'
  }
});

export default mongoose.model('RequisicaoImpressao', RequisicaoImpressaoSchema);
