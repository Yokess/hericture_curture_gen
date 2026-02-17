package heritage.gen.modules.design.model;

import lombok.Data;

@Data
public class SaveDesignRequest {
    private Long userId;
    private DesignProject project;
    private String userIdea;

    private java.util.List<java.util.Map<String, String>> chatHistory;
}
