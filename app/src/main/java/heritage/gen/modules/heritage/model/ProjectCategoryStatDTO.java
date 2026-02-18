package heritage.gen.modules.heritage.model;

public class ProjectCategoryStatDTO {
    private String category;
    private Long count;

    public ProjectCategoryStatDTO() {
    }

    public ProjectCategoryStatDTO(String category, Long count) {
        this.category = category;
        this.count = count;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}

