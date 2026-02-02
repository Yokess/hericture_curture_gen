package heritage.gen.modules.heritage.model;

import java.util.List;

/**
 * 非遗项目详情 DTO
 */
public record ProjectDetailDTO(
        Long id,
        String officialId,
        String name,
        String category,
        String location,
        String description,
        String batch,
        String officialUrl,
        List<SuccessorListItemDTO> successors) {
    public static ProjectDetailDTO fromEntity(
            IchProjectEntity entity,
            List<SuccessorListItemDTO> successors) {
        return new ProjectDetailDTO(
                entity.getId(),
                entity.getOfficialId(),
                entity.getName(),
                entity.getCategory(),
                entity.getLocation(),
                entity.getDescription(),
                entity.getBatch(),
                entity.getOfficialUrl(),
                successors);
    }
}
