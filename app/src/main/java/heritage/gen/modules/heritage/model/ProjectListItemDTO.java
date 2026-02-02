package heritage.gen.modules.heritage.model;

/**
 * 非遗项目列表项 DTO
 */
public record ProjectListItemDTO(
        Long id,
        String officialId,
        String name,
        String category,
        String location,
        String batch,
        Integer successorCount) {
    public static ProjectListItemDTO fromEntity(IchProjectEntity entity, Integer successorCount) {
        return new ProjectListItemDTO(
                entity.getId(),
                entity.getOfficialId(),
                entity.getName(),
                entity.getCategory(),
                entity.getLocation(),
                entity.getBatch(),
                successorCount);
    }
}
