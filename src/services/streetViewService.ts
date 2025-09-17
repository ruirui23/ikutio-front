import * as THREE from 'three';
import type { StreetViewConfig, TextureLoadResult } from '../types/streetView';

export class StreetViewService {
    /**
     * テスト用のテクスチャを作成
     */
    static createTestTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 640; // 解像度を上げる
        canvas.height = 640; // 正方形に変更
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
        canvas.width = 640; // 解像度を上げる
        canvas.height = 640; // 正方形に変更
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
                    console.error('Error loading Street View image:', error);

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

    /**
     * 360度パノラマ用のテストテクスチャを作成
     */
    static createPanoramaTestTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        const width = 2048;
        const height = 1024; // 2:1のアスペクト比（360度パノラマ）
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas context could not be created');
        }

        // 空のグラデーション背景を作成
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB'); // 空色
        gradient.addColorStop(0.7, '#98FB98'); // 淡い緑
        gradient.addColorStop(1, '#8FBC8F'); // 暗い緑

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 地平線
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.lineTo(width, height * 0.7);
        ctx.stroke();

        // 方角を示すラベルと色分け
        const directions = [
            { angle: 0, label: '北', color: '#FF6B6B', x: width * 0.5 },
            { angle: 90, label: '東', color: '#4ECDC4', x: width * 0.75 },
            { angle: 180, label: '南', color: '#45B7D1', x: width * 1.0 },
            { angle: 270, label: '西', color: '#A8E6CF', x: width * 0.25 }
        ];

        directions.forEach((dir, index) => {
            // 方向に応じた縦の帯を描画
            const bandWidth = width / 4;
            const startX = (index * bandWidth) % width;

            ctx.fillStyle = dir.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(startX, 0, bandWidth, height);

            // 方角ラベル
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dir.label, startX + bandWidth / 2, 80);
            ctx.fillText(`${dir.angle}°`, startX + bandWidth / 2, 140);
        });

        // グリッド線
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;

        // 縦線（経度線）
        for (let i = 0; i <= 8; i++) {
            const x = (width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 横線（緯度線）
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 中央にタイトル
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('360° パノラマテスト', width / 2, height / 2);

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.mapping = THREE.EquirectangularReflectionMapping;
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
        canvasTexture.flipY = false;

        return canvasTexture;
    }

    /**
     * Google Street View APIから360度パノラマ画像を取得
     * 注意: Google Street View Static APIは360度パノラマを直接提供しません
     * この関数は複数の方角（北、東、南、西）の画像を結合して疑似パノラマを作成します
     */
    static async getPanoramaFromCoordinates(
        latitude: number,
        longitude: number,
        apiKey?: string
    ): Promise<TextureLoadResult> {
        if (!apiKey || apiKey.trim() === '') {
            return {
                texture: StreetViewService.createPanoramaTestTexture(),
                isFromApi: false,
                coordinate: { latitude, longitude }
            };
        }

        try {
            // 4つの方向（北、東、南、西）の画像を取得
            const directions = [0, 90, 180, 270];
            const imagePromises = directions.map(heading =>
                StreetViewService.loadStreetViewImage(latitude, longitude, apiKey, {
                    size: '512x512',
                    fov: 90,
                    heading,
                    pitch: 0
                })
            );

            const images = await Promise.all(imagePromises);

            // キャンバスに4つの画像を横に並べて配置
            const canvas = document.createElement('canvas');
            canvas.width = 2048; // 512 * 4
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Canvas context could not be created');
            }

            // 各画像をキャンバスに描画
            for (let i = 0; i < images.length; i++) {
                if (images[i]) {
                    ctx.drawImage(images[i], i * 512, 0, 512, 512);
                }
            }

            // パノラマテクスチャとして設定
            const panoramaTexture = new THREE.CanvasTexture(canvas);
            panoramaTexture.mapping = THREE.EquirectangularReflectionMapping;
            panoramaTexture.wrapS = THREE.RepeatWrapping;
            panoramaTexture.wrapT = THREE.ClampToEdgeWrapping;
            panoramaTexture.flipY = false;

            return {
                texture: panoramaTexture,
                isFromApi: true,
                coordinate: { latitude, longitude }
            };
        } catch (error) {
            console.error('Error creating panorama from coordinates:', error);
            return {
                texture: StreetViewService.createPanoramaTestTexture(),
                isFromApi: false,
                coordinate: { latitude, longitude }
            };
        }
    }

    /**
     * Street View画像をHTMLImageElementとして取得（ヘルパー関数）
     */
    private static loadStreetViewImage(
        latitude: number,
        longitude: number,
        apiKey: string,
        config: StreetViewConfig
    ): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const {
                size = '512x512',
                fov = 90,
                heading = 0,
                pitch = 0
            } = config;

            const location = `${latitude},${longitude}`;
            const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(location)}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    }
}
