package heritage.gen.modules.design.model;

/**
 * 图像生成状态
 */
public enum GenerationStatus {
    /**
     * 等待处理
     */
    PENDING,

    /**
     * 处理中
     */
    PROCESSING,

    /**
     * 已完成
     */
    COMPLETED,

    /**
     * 失败
     */
    FAILED
}
