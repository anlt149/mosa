import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinnerOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  flex: 1;
`;

const FullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const SpinnerRing = styled.div`
  width: 36px;
  height: 36px;
  border: 2px solid #111;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export function LoadingSpinner() {
  return (
    <SpinnerOverlay>
      <SpinnerRing />
    </SpinnerOverlay>
  );
}

export function FullScreenSpinner() {
  return (
    <FullScreenOverlay>
      <SpinnerRing />
    </FullScreenOverlay>
  );
}
