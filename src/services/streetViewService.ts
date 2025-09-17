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

        // シンプルなグレー背景
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
                size = '640x640',
                fov = 60,
                heading = 0,
                pitch = 0
            } = config;

            // 緯度,経度の形式でURLを構築
            const location = `${latitude},${longitude}`;
            const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(location)}&heading=${heading}&pitch=${pitch}&fov=${fov}&scale=2&format=png&key=${apiKey}`;

            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (loadedTexture) => {
                    loadedTexture.mapping = THREE.UVMapping;
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                    loadedTexture.flipY = true;
                    loadedTexture.needsUpdate = true;
                    loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                    loadedTexture.magFilter = THREE.LinearFilter;
                    loadedTexture.anisotropy = 16;
                    loadedTexture.generateMipmaps = true;

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
     * 座標データからテクスチャを取得
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
        const height = 1024;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas context could not be created');
        }

        // シンプルなグレー背景
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(0, 0, width, height);

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
            // 8つの方向で滑らかなパノラマを作成
            const directions = [0, 45, 90, 135, 180, 225, 270, 315];
            const imagePromises = directions.map(heading =>
                StreetViewService.loadStreetViewImage(latitude, longitude, apiKey, {
                    size: '640x640',
                    fov: 45,
                    heading,
                    pitch: -10
                })
            );

            const images = await Promise.all(imagePromises);

            // キャンバスに8つの画像を横に並べて配置（360度均等分割）
            const canvas = document.createElement('canvas');
            const imageWidth = 640;
            canvas.width = imageWidth * images.length; // 8つの画像を隙間なく配置
            canvas.height = 640;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Canvas context could not be created');
            }

            // 高品質な画像レンダリング設定
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 各画像をキャンバスに描画（境界ブレンディング付き）
            for (let i = 0; i < images.length; i++) {
                if (images[i]) {
                    const x = i * imageWidth;

                    // 境界でのソフトブレンディングのためのマスクを作成
                    if (i > 0) {
                        // 左端をフェードイン
                        const fadeWidth = 20;
                        const gradient = ctx.createLinearGradient(x, 0, x + fadeWidth, 0);
                        gradient.addColorStop(0, 'rgba(0,0,0,0)');
                        gradient.addColorStop(1, 'rgba(0,0,0,1)');

                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.fillStyle = gradient;
                        ctx.fillRect(x, 0, fadeWidth, 640);
                        ctx.restore();
                    }

                    ctx.drawImage(images[i], x, 0, imageWidth, 640);

                    if (i < images.length - 1) {
                        // 右端をフェードアウト
                        const fadeWidth = 20;
                        const gradient = ctx.createLinearGradient(x + imageWidth - fadeWidth, 0, x + imageWidth, 0);
                        gradient.addColorStop(0, 'rgba(0,0,0,1)');
                        gradient.addColorStop(1, 'rgba(0,0,0,0)');

                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.fillStyle = gradient;
                        ctx.fillRect(x + imageWidth - fadeWidth, 0, fadeWidth, 640);
                        ctx.restore();
                    }
                }
            }

            // パノラマテクスチャとして設定
            const panoramaTexture = new THREE.CanvasTexture(canvas);
            panoramaTexture.mapping = THREE.EquirectangularReflectionMapping;
            panoramaTexture.wrapS = THREE.RepeatWrapping;
            panoramaTexture.wrapT = THREE.ClampToEdgeWrapping;
            panoramaTexture.flipY = false;
            panoramaTexture.minFilter = THREE.LinearMipmapLinearFilter;
            panoramaTexture.magFilter = THREE.LinearFilter;
            panoramaTexture.anisotropy = 16;
            panoramaTexture.generateMipmaps = true;

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
     * Street View画像をHTMLImageElementとして取得
     */
    private static loadStreetViewImage(
        latitude: number,
        longitude: number,
        apiKey: string,
        config: StreetViewConfig
    ): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const {
                size = '640x640',
                fov = 60,
                heading = 0,
                pitch = 0
            } = config;

            const location = `${latitude},${longitude}`;
            const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(location)}&heading=${heading}&pitch=${pitch}&fov=${fov}&scale=2&format=png&key=${apiKey}`;

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    }
}
