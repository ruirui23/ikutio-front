import { Text } from '@react-three/drei';

interface StatusDisplayProps {
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  position?: [number, number, number];
}

export function StatusDisplay({ 
  loading = false, 
  error = null, 
  loadingMessage = "Loading Street View...",
  position = [0, 0, -10]
}: StatusDisplayProps) {
  return (
    <>
      {loading && (
        <Text
          position={position}
          fontSize={3}
          color="yellow"
          anchorX="center"
          anchorY="middle"
        >
          {loadingMessage}
        </Text>
      )}
      
      {error && (
        <Text
          position={[position[0], position[1] - 5, position[2]]}
          fontSize={2}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          {error}
        </Text>
      )}
    </>
  );
}
