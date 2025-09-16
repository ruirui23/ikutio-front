import * as THREE from 'three';
import type { StreetViewConfig, TextureLoadResult } from '../types/streetView';

export class StreetViewService {
    /**
     * テスト用のテクスチャを作成
     */
    static createTestTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas context could not be created');
        }

        // 空のグラデーション背景を作成
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.4, '#98D8E8');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#228B22');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 雲を追加
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.4;
            const radius = Math.random() * 30 + 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // グリッド線を追加
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        // 垂直線
        for (let i = 0; i <= 8; i++) {
            const x = (canvas.width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // 水平線
        for (let i = 0; i <= 4; i++) {
            const y = (canvas.height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.mapping = THREE.UVMapping;
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
        canvasTexture.flipY = false;

        return canvasTexture;
    }

    /**
     * heading固有のテスト用テクスチャを作成
     */
    static createTestTextureWithHeading(heading: number): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas context could not be created');
        }

        // headingに応じて異なる色のベースを作成
        const colors = {
            0: { primary: '#FF6B6B', secondary: '#FFE66D', label: 'North (0°)' },
            90: { primary: '#4ECDC4', secondary: '#45B7B8', label: 'East (90°)' },
            180: { primary: '#45B7D1', secondary: '#6C5CE7', label: 'South (180°)' },
            270: { primary: '#A8E6CF', secondary: '#88D8A3', label: 'West (270°)' }
        };

        const colorSet = colors[heading as keyof typeof colors] || colors[0];

        // グラデーション背景を作成
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colorSet.primary);
        gradient.addColorStop(0.5, colorSet.secondary);
        gradient.addColorStop(1, colorSet.primary);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 方向を示す矢印を描画
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(colorSet.label, canvas.width / 2, canvas.height / 2 - 50);

        // 矢印を描画
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 30;
        const arrowSize = 60;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();

        // headingに応じて矢印の向きを変更
        const angle = (heading * Math.PI) / 180;
        const x1 = centerX + Math.sin(angle) * arrowSize;
        const y1 = centerY - Math.cos(angle) * arrowSize;
        const x2 = centerX + Math.sin(angle + 2.6) * (arrowSize * 0.6);
        const y2 = centerY - Math.cos(angle + 2.6) * (arrowSize * 0.6);
        const x3 = centerX + Math.sin(angle - 2.6) * (arrowSize * 0.6);
        const y3 = centerY - Math.cos(angle - 2.6) * (arrowSize * 0.6);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();

        // グリッド線を追加
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        // 垂直線
        for (let i = 0; i <= 8; i++) {
            const x = (canvas.width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // 水平線
        for (let i = 0; i <= 4; i++) {
            const y = (canvas.height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.mapping = THREE.UVMapping;
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
        canvasTexture.flipY = true;

        return canvasTexture;
    }

    /**
     * 緯度・経度の座標からStreet View APIのテクスチャを取得
     */
    static loadStreetViewTextureFromCoordinates(
        latitude: number,
        longitude: number,
        apiKey: string,
        config: StreetViewConfig = {}
    ): Promise<TextureLoadResult> {
        return new Promise((resolve) => {
            const {
                size = '1024x512',
                fov = 120,
                heading = 0,
                pitch = 0
            } = config;

            // 緯度,経度の形式でURLを構築
            const location = `${latitude},${longitude}`;
            const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(location)}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;

            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (loadedTexture) => {
                    loadedTexture.mapping = THREE.UVMapping;
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                    loadedTexture.flipY = true;
                    loadedTexture.needsUpdate = true;

                    resolve({
                        texture: loadedTexture,
                        isFromApi: true,
                        coordinate: { latitude, longitude }
                    });
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('❌ Error loading Street View image:', error);

                    // エラーが発生した場合はテストテクスチャを返す
                    const testTexture = StreetViewService.createTestTexture();
                    resolve({
                        texture: testTexture,
                        isFromApi: false,
                        coordinate: { latitude, longitude }
                    });
                }
            );
        });
    }

    /**
     * 座標データからテクスチャを取得（メインメソッド）
     */
    static async getTextureFromCoordinates(
        latitude: number,
        longitude: number,
        apiKey?: string,
        config?: StreetViewConfig
    ): Promise<TextureLoadResult> {
        if (!apiKey || apiKey.trim() === '') {
            return {
                texture: StreetViewService.createTestTexture(),
                isFromApi: false,
                coordinate: { latitude, longitude }
            };
        }

        return StreetViewService.loadStreetViewTextureFromCoordinates(latitude, longitude, apiKey, config);
    }
}
