import * as THREE from 'three';
import type {
    VRControllerData,
    VRControllerPose,
    VRControllerCrossing,
    VRControllerCounterState,
    VRControllerCountCallback
} from '../types/vrController';

export class VRControllerService {
    private static instance: VRControllerService;
    private state: VRControllerCounterState = {
        leftCount: 0,
        rightCount: 0,
        lastCrossTime: 0,
        wasLeftAbove: null,
        bothInitialized: false
    };

    private constructor() { }

    public static getInstance(): VRControllerService {
        if (!VRControllerService.instance) {
            VRControllerService.instance = new VRControllerService();
        }
        return VRControllerService.instance;
    }

    /**
     * WebXRセッションからコントローラーデータを取得
     */
    public getControllerData(gl: THREE.WebGLRenderer, session: XRSession | null): VRControllerData {
        if (!session || !gl.xr.isPresenting) {
            return {
                left: null,
                right: null,
                isPresenting: false,
                bothInitialized: false
            };
        }

        const referenceSpace = gl.xr.getReferenceSpace();
        const frame = gl.xr.getFrame();

        if (!referenceSpace || !frame) {
            return {
                left: null,
                right: null,
                isPresenting: true,
                bothInitialized: false
            };
        }

        // 左右のコントローラーを検索
        const leftSource = Array.from(session.inputSources).find(
            source => source.handedness === 'left' && source.targetRayMode === 'tracked-pointer'
        );
        const rightSource = Array.from(session.inputSources).find(
            source => source.handedness === 'right' && source.targetRayMode === 'tracked-pointer'
        );

        const leftPose = this.getControllerPose(leftSource, frame, referenceSpace, 'left');
        const rightPose = this.getControllerPose(rightSource, frame, referenceSpace, 'right');

        const bothInitialized = leftPose?.isTracked && rightPose?.isTracked;
        if (bothInitialized && !this.state.bothInitialized) {
            this.state.bothInitialized = true;
        }

        return {
            left: leftPose,
            right: rightPose,
            isPresenting: true,
            bothInitialized: this.state.bothInitialized
        };
    }

    /**
     * 個別のコントローラーのポーズを取得
     */
    private getControllerPose(
        inputSource: XRInputSource | undefined,
        frame: XRFrame,
        referenceSpace: XRReferenceSpace,
        handedness: 'left' | 'right'
    ): VRControllerPose | null {
        if (!inputSource) {
            return null;
        }

        const space = inputSource.gripSpace || inputSource.targetRaySpace;
        if (!space) {
            return null;
        }

        const pose = frame.getPose(space, referenceSpace);
        if (!pose) {
            return null;
        }

        return {
            position: {
                x: pose.transform.position.x,
                y: pose.transform.position.y,
                z: pose.transform.position.z
            },
            handedness,
            isTracked: true
        };
    }

    /**
     * コントローラーの交差を検出し、カウントを更新
     */
    public detectCrossing(
        controllerData: VRControllerData,
        cooldownMs: number = 300,
        onCount?: VRControllerCountCallback
    ): VRControllerCrossing {
        const defaultResult: VRControllerCrossing = {
            occurred: false,
            triggerHand: 'left',
            totalCount: this.state.leftCount + this.state.rightCount,
            leftCount: this.state.leftCount,
            rightCount: this.state.rightCount,
            yDifference: 0
        };

        if (!controllerData.left || !controllerData.right || !controllerData.bothInitialized) {
            return defaultResult;
        }

        const now = Date.now();
        const leftPos = controllerData.left.position;
        const rightPos = controllerData.right.position;

        // Y軸での上下関係を判定
        const isLeftAbove = leftPos.y > rightPos.y;
        const yDifference = Math.abs(leftPos.y - rightPos.y);

        // クールダウン期間をチェック
        const cooldownRemaining = Math.max(0, cooldownMs - (now - this.state.lastCrossTime));

        // 交差が発生したかをチェック
        if (this.state.wasLeftAbove !== null &&
            this.state.wasLeftAbove !== isLeftAbove &&
            cooldownRemaining === 0 &&
            yDifference > 0.02) {

            // 交差が発生！
            const totalCount = this.state.leftCount + this.state.rightCount + 1;
            const triggerHand = isLeftAbove ? 'right' : 'left';

            // カウントを更新
            this.state.leftCount = Math.ceil(totalCount / 2);
            this.state.rightCount = Math.floor(totalCount / 2);
            this.state.lastCrossTime = now;

            // コールバックを実行
            onCount?.(totalCount, triggerHand);

            // 上下関係を保存（次回の比較用）
            this.state.wasLeftAbove = isLeftAbove;

            return {
                occurred: true,
                triggerHand,
                totalCount,
                leftCount: this.state.leftCount,
                rightCount: this.state.rightCount,
                yDifference
            };
        }

        // 上下関係を保存（次回の比較用）
        this.state.wasLeftAbove = isLeftAbove;

        return {
            ...defaultResult,
            leftCount: this.state.leftCount,
            rightCount: this.state.rightCount,
            yDifference
        };
    }

    /**
     * 現在のカウント状態を取得
     */
    public getCounterState(): { leftCount: number; rightCount: number } {
        return {
            leftCount: this.state.leftCount,
            rightCount: this.state.rightCount
        };
    }

    /**
     * カウンターをリセット
     */
    public resetCounter(): void {
        this.state.leftCount = 0;
        this.state.rightCount = 0;
        this.state.lastCrossTime = 0;
        this.state.wasLeftAbove = null;
        this.state.bothInitialized = false;
    }
}
