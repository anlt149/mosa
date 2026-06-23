import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Camera, Upload, Home, UtensilsCrossed, Loader2, CheckCircle2 } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';
import { mealService } from '../services/mealService';

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  
  svg {
    color: #10b981;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OptionButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.1)' : '#18181b'};
  border: 1px solid ${({ $active }) => $active ? '#10b981' : '#27272a'};
  color: ${({ $active }) => $active ? '#10b981' : '#a1a1aa'};
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.15)' : '#27272a'};
    color: ${({ $active }) => $active ? '#10b981' : '#fff'};
  }
`;

const ImagePreviewContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  border: 1px dashed #3f3f46;
  background: #18181b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    border-color: #52525b;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadText = styled.span`
  color: #a1a1aa;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #10b981;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.875rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  justify-content: center;
  font-weight: 600;
  padding: 1rem;
`;

interface MealTrackerProps {
  onMealLogged?: () => void;
}

export function MealTracker({ onMealLogged }: MealTrackerProps) {
  const [locationType, setLocationType] = useState<'eat_out' | 'eat_home'>('eat_home');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Resize to max 1024x1024
      const resizedBlob = await resizeImage(file, 1024, 1024);
      setPhotoBlob(resizedBlob);
      
      // Create local preview URL
      const objectUrl = URL.createObjectURL(resizedBlob);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const filename = photoBlob ? `meal-photo-${Date.now()}.jpg` : undefined;
      
      await mealService.uploadImageAndLogMeal(locationType, photoBlob, filename);
      
      setSuccess(true);
      if (onMealLogged) {
        onMealLogged();
      }
      setTimeout(() => {
        setSuccess(false);
        setPhotoBlob(null);
        setPreviewUrl(null);
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log meal';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Header>
        <UtensilsCrossed size={20} />
        Log a Meal
      </Header>

      <ButtonGroup>
        <OptionButton 
          $active={locationType === 'eat_home'} 
          onClick={() => setLocationType('eat_home')}
        >
          <Home size={24} />
          Eat at Home
        </OptionButton>
        <OptionButton 
          $active={locationType === 'eat_out'} 
          onClick={() => setLocationType('eat_out')}
        >
          <UtensilsCrossed size={24} />
          Eat Out
        </OptionButton>
      </ButtonGroup>

      <ImagePreviewContainer onClick={() => fileInputRef.current?.click()}>
        {previewUrl ? (
          <img src={previewUrl} alt="Meal preview" />
        ) : (
          <>
            <Camera size={32} color="#a1a1aa" />
            <UploadText>Tap to take a photo</UploadText>
          </>
        )}
      </ImagePreviewContainer>
      
      <HiddenInput 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handlePhotoCapture}
      />

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {success ? (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          Meal logged successfully!
        </SuccessMessage>
      ) : (
        <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Save Meal
            </>
          )}
        </SubmitButton>
      )}
    </Card>
  );
}
