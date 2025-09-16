import React, { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StreetViewService } from '../services/streetViewService';
import { StatusDisplay } from './StatusDisplay';
import type { PathData } from '../types/streetView';

interface MultiHeadingStreetViewProps {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  headingOrder?: number[]; // 任意の順番を指定できるプロパティ
  imageSize?: string; // 画像解像度を指定できるプロパティ（例: '640x640', '1024x512'）
}

interface ImageData {
  texture: THREE.Texture | THREE.CanvasTexture | null;
  heading: number;
  loading: boolean;
  error: string | null;
}

export function MultiHeadingStreetView({ 
  pathData, 
  currentPointIndex = 0, 
  apiKey,
  headingOrder = [0, 90, 180, 270], // デフォルト値を設定
  imageSize = '640x640' // 高解像度をデフォルトに設定
}: MultiHeadingStreetViewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [images, setImages] = useState<ImageData[]>(() => 
    headingOrder.map(heading => ({
      texture: null, 
      heading: heading, 
      loading: false, 
      error: null
    }))
  );
  const [lastCoordinate, setLastCoordinate] = useState<{latitude: number, longitude: number} | null>(null);

  const loadTexturesFromCoordinates = useCallback(async (latitude: number, longitude: number, key?: string) => {
    // headingOrderを使用して動的にヘディング値を設定
    const headings = headingOrder;
    
    // すべての画像のローディング状態を開始
    setImages(prev => prev.map(img => ({ ...img, loading: true, error: null })));
    
    try {
      const loadPromises = headings.map(async (heading, index) => {
        try {
          const result = await StreetViewService.getTextureFromCoordinates(
            latitude, 
            longitude, 
            key, 
            { heading: heading, size: imageSize }
          );
          
          return {
            texture: result.texture,
            heading: heading,
            loading: false,
            error: !result.isFromApi && key && key.trim() !== '' ? 'Street View画像の読み込みに失敗しました' : null,
            originalIndex: index
          };
        } catch (err) {
          console.error(`Error loading texture for heading ${heading}:`, err);
          const testTexture = StreetViewService.createTestTextureWithHeading(heading);
          return {
            texture: testTexture,
            heading: heading,
            loading: false,
            error: 'テクスチャの読み込み中にエラーが発生しました',
            originalIndex: index
          };
        }
      });

      const loadedImages = await Promise.all(loadPromises);
      // 元のインデックス順でソートして順序を保証
      const sortedImages = loadedImages.sort((a, b) => a.originalIndex - b.originalIndex);
      // originalIndexプロパティを除去してからセット
      const finalImages = sortedImages.map(({ originalIndex, ...rest }) => rest);
      setImages(finalImages);
    } catch (err) {
      console.error('Error loading textures:', err);
      // エラーが発生した場合はすべてテストテクスチャに設定
      setImages(headingOrder.map(heading => ({
        texture: StreetViewService.createTestTextureWithHeading(heading),
        heading: heading,
        loading: false,
        error: 'テクスチャの読み込み中にエラーが発生しました'
      })));
    }
  }, [headingOrder, imageSize]);

  React.useEffect(() => {
    if (pathData && pathData.pathData && pathData.pathData.length > 0) {
      const currentPoint = pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)];
      const currentCoordinate = { latitude: currentPoint.latitude, longitude: currentPoint.longitude };
      
      // 前回と同じ座標でない場合のみ読み込み
      if (!lastCoordinate || 
          currentCoordinate.latitude !== lastCoordinate.latitude || 
          currentCoordinate.longitude !== lastCoordinate.longitude) {
        setLastCoordinate(currentCoordinate);
        loadTexturesFromCoordinates(currentPoint.latitude, currentPoint.longitude, apiKey);
      }
    }
    else if (images.every(img => !img.texture) && !pathData) {
      // パスデータがない場合はテストテクスチャを設定
      setImages(headingOrder.map(heading => ({
        texture: StreetViewService.createTestTextureWithHeading(heading),
        heading: heading,
        loading: false,
        error: null
      })));
    }
  }, [pathData, currentPointIndex, apiKey, loadTexturesFromCoordinates, lastCoordinate, headingOrder, imageSize]);

  // 各球体セクションのメッシュを更新
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && images[index]?.texture) {
          const material = child.material as THREE.MeshBasicMaterial;
          material.map = images[index].texture;
          material.needsUpdate = true;
        }
      });
    }
  }, [images]);

  const isLoading = images.some(img => img.loading);
  const errorMessage = images.find(img => img.error)?.error || null;

  return (
    <>
      <group ref={groupRef}>
        {/* 球体をheadingOrder配列の長さに応じてセクションに分けて、それぞれに異なるテクスチャを適用 */}
        {images.map((imageData, index) => {
          // セクション数に応じて回転角度を計算
          const sectionAngle = (2 * Math.PI) / images.length;
          const rotationY = index * sectionAngle;
          
          return (
            <mesh 
              key={`sphere-section-${index}`}
              rotation={[0, rotationY, 0]}
              scale={[-1, 1, 1]} // 球体を内側から見るため
            >
              <sphereGeometry 
                args={[50, 32, 16, 0, sectionAngle]} // 半径50、動的なセクション角度
              />
              <meshBasicMaterial 
                map={imageData.texture} 
                transparent={false}
                side={THREE.BackSide} // 内側から見る
              />
            </mesh>
          );
        })}
      </group>
      
      <StatusDisplay
        loading={isLoading}
        error={errorMessage}
      />
    </>
  );
}
