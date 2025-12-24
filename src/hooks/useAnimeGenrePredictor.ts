import { useState, useEffect, useCallback } from 'react';
import { animeGenrePredictor } from '../services/animeGenrePredictor';
import type { GenrePrediction, PredictionResult } from '../services/animeGenrePredictor';

type UseAnimeGenrePredictorState = {
  isLoading: boolean;
  isModelLoading: boolean;
  predictions: GenrePrediction[];
  error: string | null;
  processingTime: number;
};

export const useAnimeGenrePredictor = (modelUrl?: string) => {
  const [state, setState] = useState<UseAnimeGenrePredictorState>({
    isLoading: false,
    isModelLoading: false,
    predictions: [],
    error: null,
    processingTime: 0,
  });

  // Initialize model on mount
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setState((prev) => ({ ...prev, isModelLoading: true, error: null }));
        await animeGenrePredictor.initialize(modelUrl);
        setState((prev) => ({ ...prev, isModelLoading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
        setState((prev) => ({
          ...prev,
          isModelLoading: false,
          error: errorMessage,
        }));
      }
    };

    initializeModel();

    // Cleanup on unmount
    return () => {
      animeGenrePredictor.dispose();
    };
  }, [modelUrl]);

  // Predict dari file gambar
  const predictFromImage = useCallback(async (imageFile: File) => {
    if (!animeGenrePredictor.isModelLoaded()) {
      // Wait for model to be loaded
      let attempts = 0;
      const maxAttempts = 50;

      while (!animeGenrePredictor.isModelLoaded() && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!animeGenrePredictor.isModelLoaded()) {
        setState((prev) => ({
          ...prev,
          error: 'Model belum siap untuk digunakan',
        }));
        return;
      }
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: PredictionResult = await animeGenrePredictor.predictFromImage(imageFile);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        predictions: result.predictions,
        processingTime: result.processingTime,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Prediksi gagal';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Predict dari URL gambar
  const predictFromURL = useCallback(async (imageUrl: string) => {
    if (!animeGenrePredictor.isModelLoaded()) {
      // Wait for model to be loaded
      let attempts = 0;
      const maxAttempts = 50;

      while (!animeGenrePredictor.isModelLoaded() && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!animeGenrePredictor.isModelLoaded()) {
        setState((prev) => ({
          ...prev,
          error: 'Model belum siap untuk digunakan',
        }));
        return;
      }
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: PredictionResult = await animeGenrePredictor.predictFromURL(imageUrl);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        predictions: result.predictions,
        processingTime: result.processingTime,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Prediksi gagal';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Clear predictions
  const clearPredictions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      predictions: [],
      error: null,
      processingTime: 0,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    predictFromImage,
    predictFromURL,
    clearPredictions,
    clearError,
    isModelReady: animeGenrePredictor.isModelLoaded(),
  };
};
