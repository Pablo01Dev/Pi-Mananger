import mongoose from 'mongoose';

const placaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  largura: { type: Number, required: true },
  altura: { type: Number, required: true },
  material: { type: String, enum: ['Lona', 'Adesivo'], required: true },
  tipo: { type: String, enum: ['Alugue', 'Compre', 'Alugue ou compre', 'Outros'], required: true },
  quantidade: { type: Number, required: true },
  observacao: { type: String },
  status: { type: String, enum: ['produzir', 'pagar', 'pago', 'disponivel', 'usada'], default: 'produzir' },
  dataEnvio: { type: Date },
  valor: { type: Number }  // <-- Adicione este campo
}, {
  timestamps: true
});


export default mongoose.model('Placa', placaSchema);
