export interface DesignMaterial {
    name: string;
    finish: string;
}

export interface DesignColor {
    name: string;
    hex: string;
}

export interface DesignProject {
    id?: string;
    conceptName: string;
    designPhilosophy: string;
    culturalContext: string;
    formFactor: string;
    dimensions?: string;
    userInteraction: string;
    materials?: DesignMaterial[];
    colors?: DesignColor[];
    keyFeatures?: string[];
    blueprintUrl?: string;
    productShotUrl?: string;
}
