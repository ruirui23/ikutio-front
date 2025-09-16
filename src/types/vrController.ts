export interface VRControllerPosition {
    x: number;
    y: number;
    z: number;
}

export interface VRControllerPose {
    position: VRControllerPosition;
    handedness: 'left' | 'right';
    isTracked: boolean;
}

export interface VRControllerData {
    left: VRControllerPose | null;
    right: VRControllerPose | null;
    isPresenting: boolean;
    bothInitialized: boolean;
}

export interface VRControllerCrossing {
    occurred: boolean;
    triggerHand: 'left' | 'right';
    totalCount: number;
    leftCount: number;
    rightCount: number;
    yDifference: number;
}

export interface VRControllerCounterState {
    leftCount: number;
    rightCount: number;
    lastCrossTime: number;
    wasLeftAbove: boolean | null;
    bothInitialized: boolean;
}

export type VRControllerCountCallback = (count: number, hand: 'left' | 'right') => void;
