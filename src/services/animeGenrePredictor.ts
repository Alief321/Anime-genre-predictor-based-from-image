import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export type GenrePrediction = {
  genre: string;
  confidence: number;
};

export type PredictionResult = {
  predictions: GenrePrediction[];
  processingTime: number;
};

// Definisi genre anime yang akan diprediksi
const ANIME_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life'];

class AnimeGenrePredictorService {
  private model: tf.LayersModel | null = null;
  private isLoading = false;
  private imageSize = 224; // Ukuran standar untuk model gambar

  /**
   * Inisialisasi service dan load model
   */
  async initialize(modelUrl: string = '/models/model.json'): Promise<void> {
    if (this.model) {
      return; // Model sudah di-load
    }

    if (this.isLoading) {
      return; // Sedang loading
    }

    this.isLoading = true;

    try {
      // Set backend untuk performa optimal
      try {
        await tf.setBackend('webgl');
      } catch (e) {
        console.warn('WebGL backend tidak tersedia, menggunakan CPU:', e);
        await tf.setBackend('cpu');
      }
      await tf.ready();

      // Load model dari URL
      try {
        this.model = await tf.loadLayersModel(modelUrl);
        console.log('Model anime genre predictor berhasil di-load dari', modelUrl);
      } catch (error) {
        console.warn('Gagal load model dari URL, menggunakan mock model untuk development:', error);
        // Gunakan mock model untuk development/testing
        this.model = this.createMockModel();
        console.log('Mock model berhasil dibuat untuk testing');
      }
    } catch (error) {
      console.error('Gagal initialize service:', error);
      throw new Error('Gagal memuat model prediksi genre anime');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Create mock model untuk development/testing
   */
  private createMockModel(): tf.LayersModel {
    // Input layer
    const input = tf.input({ shape: [this.imageSize, this.imageSize, 3] });

    // Simple mock model untuk testing
    let output = tf.layers
      .conv2d({
        filters: 8,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
      })
      .apply(input) as tf.SymbolicTensor;

    output = tf.layers.maxPooling2d({ poolSize: 2 }).apply(output) as tf.SymbolicTensor;

    output = tf.layers.flatten().apply(output) as tf.SymbolicTensor;

    output = tf.layers
      .dense({
        units: 64,
        activation: 'relu',
      })
      .apply(output) as tf.SymbolicTensor;

    output = tf.layers
      .dense({
        units: ANIME_GENRES.length,
        activation: 'softmax',
      })
      .apply(output) as tf.SymbolicTensor;

    const model = tf.model({ inputs: input, outputs: output });
    return model;
  }

  /**
   * Prediksi genre dari gambar yang diupload
   */
  async predictFromImage(imageFile: File): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model belum di-inisialisasi. Panggil initialize() terlebih dahulu.');
    }

    const startTime = performance.now();

    // Baca file menjadi data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Gagal membaca file'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(imageFile);
    });

    // Load image dari data URL
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Gagal membaca gambar'));
      image.src = dataUrl;
    });

    // Proses gambar dan prediksi
    const tensor = this.preprocessImage(img);
    const predictions = this.model.predict(tensor) as tf.Tensor;
    const predictionArray = predictions.dataSync() as Float32Array;
    const processingTime = performance.now() - startTime;

    const results = this.formatPredictions(predictionArray);

    tensor.dispose();
    predictions.dispose();

    return {
      predictions: results,
      processingTime,
    };
  }

  /**
   * Prediksi dari image URL
   */
  async predictFromURL(imageUrl: string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model belum di-inisialisasi. Panggil initialize() terlebih dahulu.');
    }

    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        tf.tidy(() => {
          try {
            const tensor = this.preprocessImage(img);
            const predictions = this.model!.predict(tensor) as tf.Tensor;
            const predictionArray = predictions.dataSync() as Float32Array;
            const processingTime = performance.now() - startTime;

            const results = this.formatPredictions(predictionArray);

            tensor.dispose();
            predictions.dispose();

            resolve({
              predictions: results,
              processingTime,
            });
          } catch (error) {
            reject(error);
          }
        });
      };

      img.onerror = () => {
        reject(new Error('Gagal membaca gambar dari URL'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Preprocess gambar untuk model
   */
  private preprocessImage(img: HTMLImageElement): tf.Tensor4D {
    return tf.tidy(() => {
      const tensor3d = tf.browser.fromPixels(img).toFloat();
      const resized = tf.image.resizeBilinear(tensor3d, [this.imageSize, this.imageSize]);
      const normalized = resized.div(tf.scalar(255));
      const batched = normalized.expandDims(0) as tf.Tensor4D;
      return batched;
    });
  }

  /**
   * Format hasil prediksi dengan genre names dan sort by confidence
   */
  private formatPredictions(predictionArray: Float32Array): GenrePrediction[] {
    const predictions: GenrePrediction[] = ANIME_GENRES.map((genre, index) => ({
      genre,
      confidence: Math.min(1, Math.max(0, predictionArray[index] || 0)),
    }));

    // Sort by confidence (descending)
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get daftar genre yang tersedia
   */
  getAvailableGenres(): string[] {
    return [...ANIME_GENRES];
  }

  /**
   * Dispose model dan cleanup resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }

  /**
   * Check apakah model sudah di-load
   */
  isModelLoaded(): boolean {
    return this.model !== null;
  }

  /**
   * Get status loading
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
export const animeGenrePredictor = new AnimeGenrePredictorService();
