const productModel = require('../models/productModel'); 
// === INI BARIS IMPORT YANG SUDAH DITAMBAHKAN ===
const { sendEvent } = require('../config/queue'); 

const productController = {
  // === 1. Fungsi Mengambil Semua Produk ===
  getAllProducts: async (req, res) => {
    try {
      const products = await productModel.findAll(); 
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil semua produk', error: error.message });
    }
  },
  
  // === 2. Fungsi Mengambil Produk Berdasarkan ID ===
  getProductById: async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil data produk', error: error.message });
    }
  },

  // === 3. Membuat Produk Baru (Disesuaikan dengan Halaman 4-5 PDF) ===
  createProduct: async (req, res) => {
    try {
      const { name, description, price, stock, image_url } = req.body;

      if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Kolom name, price, dan stock wajib diisi!" });
      }

      // Simpan ke database product_db lokal
      const productId = await productModel.create({ name, description, price, stock, image_url });
      
      // KIRIM EVENT KE RABBITMQ: Memicu antrean "CREATE_PRODUCT"
      await sendEvent("CREATE_PRODUCT", {
        id: productId,
        name: name,
        imageUrl: image_url || null
      });

      return res.status(201).json({ 
        message: "Produk berhasil ditambahkan", 
        productId 
      });

    } catch (error) {
      console.error("Error creating product:", error.message);
      return res.status(500).json({ 
        message: 'Error menambahkan produk', 
        error: error.message 
      });
    }
  },

  // === 4. Memperbarui Data Produk (Tambahan Sesuai Pola Modul Async) ===
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, stock, image_url } = req.body;

      // Update data di database product_db lokal melalui model
      const affectedRows = await productModel.update(id, { name, description, price, stock, image_url });

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Produk tidak ditemukan atau tidak ada perubahan data" });
      }

      // KIRIM EVENT KE RABBITMQ: Memicu antrean "UPDATE_PRODUCT"
      await sendEvent("UPDATE_PRODUCT", {
        id: id,
        name: name,
        imageUrl: image_url || null
      });

      return res.status(200).json({ message: "Produk berhasil diperbarui" });

    } catch (error) {
      console.error("Error updating product:", error.message);
      return res.status(500).json({ message: "Error memperbarui produk", error: error.message });
    }
  }
};

module.exports = productController;