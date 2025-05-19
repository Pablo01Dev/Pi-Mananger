import mongoose from 'mongoose';

const placaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  altura: { type: Number, required: true },
  largura: { type: Number, required: true },
  material: { type: String, required: true },
  tipo: { type: String, enum: ['Alugue', 'Compre', 'Alugue ou compre', 'Outros'], required: true },
  observacao: { type: String },
  dataEnvio: { type: Date },
  status: { type: String, enum: ['produzir', 'pagar', 'pago', 'disponivel', 'usada'], default: 'produzir' }
}, { timestamps: true });

export default mongoose.model('Placa', placaSchema);
