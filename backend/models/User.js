// backend/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  telefone: String,
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema);
