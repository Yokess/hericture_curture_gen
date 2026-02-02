package heritage.gen.modules.heritage.model;

/**
 * 传承人列表项 DTO
 */
public record SuccessorListItemDTO(
        Long id,
        String name,
        String gender,
        String birthYear,
        String projectName,
        String description,
        String officialUrl) {
    public static SuccessorListItemDTO fromEntity(IchSuccessorEntity entity, String projectName) {
        return new SuccessorListItemDTO(
                entity.getId(),
                entity.getName(),
                entity.getGender(),
                entity.getBirthYear(),
                projectName,
                entity.getDescription(),
                entity.getOfficialUrl());
    }
}
