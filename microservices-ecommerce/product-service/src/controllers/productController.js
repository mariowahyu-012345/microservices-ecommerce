const productModel = require('../models/productModel'); 

const productController = {
  // 1. Fungsi Mengambil Semua Produk (Sudah Bagus)
  getAllProducts: async (req, res) => {
    try {
      const products = await productModel.findAll(); 
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil semua produk', error: error.message });
    }
  },

  // 2. Fungsi Mengambil Produk Berdasarkan ID (Sudah Bagus)
  getProductById: async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil data produk', error: error.message });
    }
  },

  // 3. BAGIAN INI YANG HARUS KAMU UBAH (Diisi kembali kodenya):
  createProduct: async (req, res) => {
    try {
      const { name, description, price, stock, image_url } = req.body;

      // Validasi sederhana agar parameter MySQL tidak undefined
      if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Kolom name, price, dan stock wajib diisi!" });
      }

      // Lempar data ke model untuk disimpan ke MySQL
      const productId = await productModel.create({ name, description, price, stock, image_url });
      
      // KIRIM RESPONS INI AGAR POSTMAN TIDAK LOADING LAMA LAGI
      return res.status(201).json({ 
        message: "Produk berhasil ditambahkan", 
        productId 
      });

    } catch (error) {
      return res.status(500).json({ 
        message: 'Error menambahkan produk', 
        error: error.message 
      });
    }
  }
};

module.exports = productController;