import mongoose from 'mongoose';

const DomainSchema = new mongoose.Schema({
  domain: { type: String, unique: true },
  dr: Number,
  traffic: Number,
  keywords: Number,
  lcp: Number,
  inp: Number,
  cls: Number,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Domain || mongoose.model('Domain', DomainSchema);
