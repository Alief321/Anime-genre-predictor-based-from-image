import { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { useAnimeGenrePredictor } from '../hooks/useAnimeGenrePredictor';
import { cn } from '@/lib/utils';

interface AnimeGenrePredictorProps {
  modelUrl?: string;
  onPredictionComplete?: (predictions: Array<{ genre: string; confidence: number }>) => void;
}

export const AnimeGenrePredictor = ({ modelUrl, onPredictionComplete }: AnimeGenrePredictorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { isLoading, isModelLoading, predictions, error, processingTime, predictFromImage, clearPredictions, isModelReady } = useAnimeGenrePredictor(modelUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is image
    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar yang valid (JPG, PNG, etc)');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Predict
    const result = await predictFromImage(file);
    if (result) {
      onPredictionComplete?.(result.predictions);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    clearPredictions();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Prediksi Genre Anime</h1>
        <p className="text-muted-foreground">Upload gambar anime untuk memprediksi genre menggunakan AI</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Gambar</CardTitle>
            <CardDescription>Pilih gambar anime dari perangkat Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Loading State */}
            {!isModelReady && isModelLoading && (
              <Alert variant="default">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Memuat Model</AlertTitle>
                <AlertDescription>Model AI sedang dimuat. Mohon tunggu...</AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Image Preview */}
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative w-full overflow-hidden rounded-lg border border-input bg-muted">
                  <img src={previewUrl} alt="Preview" className="h-64 w-full object-cover" />
                </div>

                {/* Processing Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses gambar...</span>
                  </div>
                )}

                {/* Clear Button */}
                <Button variant="outline" onClick={handleClearImage} disabled={isLoading} className="w-full">
                  Ganti Gambar
                </Button>
              </div>
            ) : (
              <>
                {/* Upload Input */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isLoading || !isModelReady} />

                {/* Upload Button */}
                <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading || !isModelReady || isModelLoading} className="w-full" size="lg">
                  <Upload className="h-4 w-4" />
                  {isModelLoading ? 'Memuat Model...' : 'Pilih Gambar'}
                </Button>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      fileInputRef.current!.files = e.dataTransfer.files;
                      handleFileSelect({
                        target: { files: e.dataTransfer.files },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
                >
                  <p className="text-sm text-muted-foreground">atau drag & drop gambar ke sini</p>
                </div>

                {/* Info */}
                <p className="text-xs text-muted-foreground">
                  Format yang didukung: JPG, PNG, WebP, GIF
                  <br />
                  Ukuran file maksimal: 10MB
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Predictions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Prediksi</CardTitle>
            <CardDescription>Genre anime yang diprediksi dari gambar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {predictions.length > 0 ? (
              <>
                {/* Processing Time */}
                <p className="text-xs text-muted-foreground">Waktu pemrosesan: {processingTime.toFixed(2)}ms</p>

                {/* Top Prediction */}
                {predictions[0] && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">PREDIKSI UTAMA</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold">{predictions[0].genre}</p>
                        <p className="text-sm text-muted-foreground">Kepercayaan: {(predictions[0].confidence * 100).toFixed(1)}%</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                )}

                {/* All Predictions */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">SEMUA PREDIKSI</p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {predictions.map((pred, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{pred.genre}</span>
                          <span className="text-xs font-semibold text-muted-foreground">{(pred.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={pred.confidence * 100} className={cn('h-2', index === 0 && 'bg-primary/20')} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Results Button */}
                <Button variant="outline" onClick={handleClearImage} className="w-full">
                  Bersihkan Hasil
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-12">
                <div className="rounded-full bg-muted p-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{isLoading ? 'Memproses gambar...' : 'Belum ada prediksi'}</p>
                <p className="text-xs text-muted-foreground">Upload gambar untuk melihat hasil prediksi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
