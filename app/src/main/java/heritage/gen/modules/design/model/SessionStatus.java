package heritage.gen.modules.design.model;

/**
 * 会话状态
 */
public enum SessionStatus {
    /**
     * 对话中
     */
    CHATTING,

    /**
     * 准备生成图像
     */
    READY_TO_GENERATE,

    /**
     * 已完成
     */
    COMPLETED
}
