import mongoose from 'mongoose';

const MarketingSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
});

export default mongoose.model('Marketing', MarketingSchema);
