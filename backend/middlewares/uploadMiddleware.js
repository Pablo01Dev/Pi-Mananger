import multer from 'multer';

// Armazenar arquivo na memória
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Limite 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos MP4 são permitidos.'));
    }
  }
});

export default upload;
